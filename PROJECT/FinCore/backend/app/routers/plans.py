from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.plan import Plan, PlanFeature
from backend.app.schemas.plan import PlanResponse, PlanCreate, PlanUpdate
from backend.app.auth.security import get_current_admin, get_current_token_payload
from backend.app.models.admin import Admin
from backend.app.services.audit_service import record_audit

router = APIRouter(prefix="/api/plans", tags=["Plans"])

@router.get("/public", response_model=List[PlanResponse])
def get_public_plans(company_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Public pricing catalog for marketing and onboarding"""
    query = db.query(Plan).filter(Plan.is_active == True)
    if company_id:
        query = query.filter(Plan.finance_company_id == company_id)
    return query.all()

@router.get("", response_model=List[PlanResponse])
def list_plans(
    payload: dict = Depends(get_current_token_payload),
    db: Session = Depends(get_db)
):
    role = payload.get("role")
    company_id = payload.get("company_id")

    query = db.query(Plan)
    if role == "customer":
        # Customers see only active plans from their finance company
        return query.filter(Plan.finance_company_id == company_id, Plan.is_active == True).all()
    elif role in ("admin", "super_admin"):
        if role != "super_admin" and company_id:
            query = query.filter(Plan.finance_company_id == company_id)
        return query.all()

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")

@router.get("/{id}", response_model=PlanResponse)
def get_plan(id: int, db: Session = Depends(get_db)):
    plan = db.query(Plan).filter(Plan.id == id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return plan

@router.post("", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
def create_plan(
    data: PlanCreate,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    target_company_id = data.finance_company_id
    if admin.role != "super_admin":
        target_company_id = admin.finance_company_id

    # Check unique code
    existing = db.query(Plan).filter(
        Plan.finance_company_id == target_company_id,
        Plan.code == data.code
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Plan code already exists for this company")

    plan = Plan(
        finance_company_id=target_company_id,
        name=data.name,
        code=data.code,
        description=data.description,
        price=data.price,
        billing_cycle=data.billing_cycle,
        interest_discount_rate=data.interest_discount_rate,
        is_active=data.is_active
    )
    db.add(plan)
    db.flush()

    if data.features:
        for f in data.features:
            feat = PlanFeature(
                plan_id=plan.id,
                feature_key=f.feature_key,
                feature_label=f.feature_label,
                is_included=f.is_included
            )
            db.add(feat)

    db.commit()
    db.refresh(plan)

    record_audit(
        db=db,
        actor_type="ADMIN",
        actor_id=admin.id,
        action="CREATE_PLAN",
        entity="plans",
        entity_id=plan.id
    )

    return plan

@router.put("/{id}", response_model=PlanResponse)
def update_plan(
    id: int,
    data: PlanUpdate,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    plan = db.query(Plan).filter(Plan.id == id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    if admin.role != "super_admin" and plan.finance_company_id != admin.finance_company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    update_dict = data.model_dump(exclude_unset=True)
    features_data = update_dict.pop("features", None)

    for k, v in update_dict.items():
        setattr(plan, k, v)

    if features_data is not None:
        db.query(PlanFeature).filter(PlanFeature.plan_id == plan.id).delete()
        for f in features_data:
            feat = PlanFeature(
                plan_id=plan.id,
                feature_key=f["feature_key"],
                feature_label=f["feature_label"],
                is_included=f.get("is_included", True)
            )
            db.add(feat)

    db.commit()
    db.refresh(plan)

    record_audit(
        db=db,
        actor_type="ADMIN",
        actor_id=admin.id,
        action="UPDATE_PLAN",
        entity="plans",
        entity_id=plan.id
    )

    return plan

@router.delete("/{id}")
def delete_plan(
    id: int,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    plan = db.query(Plan).filter(Plan.id == id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    if admin.role != "super_admin" and plan.finance_company_id != admin.finance_company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Soft delete / deactivate to preserve historical integrity
    plan.is_active = False
    db.commit()

    record_audit(
        db=db,
        actor_type="ADMIN",
        actor_id=admin.id,
        action="DEACTIVATE_PLAN",
        entity="plans",
        entity_id=plan.id
    )

    return {"success": True, "message": "Plan deactivated successfully"}

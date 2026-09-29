from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.admin import Admin
from backend.app.schemas.admin import AdminResponse, AdminCreate
from backend.app.auth.security import get_current_admin, hash_password
from backend.app.services.audit_service import record_audit

router = APIRouter(prefix="/api/admins", tags=["Admins"])

@router.get("/me", response_model=AdminResponse)
def get_admin_me(admin: Admin = Depends(get_current_admin)):
    return admin

@router.get("", response_model=List[AdminResponse])
def list_admins(
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Admin)
    if admin.role != "super_admin":
        query = query.filter(Admin.finance_company_id == admin.finance_company_id)
    return query.all()

@router.post("", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
def create_admin(
    data: AdminCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if current_admin.role != "super_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only super_admin can provision administrators")

    existing = db.query(Admin).filter(Admin.email == data.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin email already in use")

    admin = Admin(
        finance_company_id=data.finance_company_id,
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=data.role,
        is_active=data.is_active
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)

    record_audit(
        db=db,
        actor_type="ADMIN",
        actor_id=current_admin.id,
        action="PROVISION_ADMIN",
        entity="admins",
        entity_id=admin.id
    )

    return admin

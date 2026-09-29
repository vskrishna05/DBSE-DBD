from typing import List
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.company import FinanceCompany
from backend.app.models.admin import Admin
from backend.app.models.plan import Plan
from backend.app.schemas.company import CompanyResponse, CompanyCreate, CompanyUpdate, CompanyRegisterRequest, CompanyRegisterResponse
from backend.app.auth.security import get_current_admin, hash_password
from backend.app.services.audit_service import record_audit

router = APIRouter(prefix="/api/companies", tags=["Finance Companies"])

@router.post("/register", response_model=CompanyRegisterResponse, status_code=status.HTTP_201_CREATED)
def register_institution(
    data: CompanyRegisterRequest,
    db: Session = Depends(get_db)
):
    """Institutional registration flow for any Bank, Small Finance Bank, or NBFC"""
    existing_co = db.query(FinanceCompany).filter(
        (FinanceCompany.name.ilike(data.name.strip())) | (FinanceCompany.code.ilike(data.code.strip()))
    ).first()
    if existing_co:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Company with name '{data.name}' or code '{data.code}' already exists"
        )

    existing_admin = db.query(Admin).filter(Admin.email == data.admin_email.strip().lower()).first()
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An administrator with this email address already exists"
        )

    company = FinanceCompany(
        name=data.name.strip(),
        code=data.code.strip().upper(),
        license_number=data.license_number.strip(),
        gstin=data.gstin.strip().upper(),
        pan_number=data.pan_number.strip().upper() if data.pan_number else None,
        contact_email=data.contact_email.strip().lower(),
        contact_phone=data.contact_phone.strip(),
        address=data.address.strip() if data.address else None,
        state=data.state.strip() if data.state else None,
        pincode=data.pincode.strip() if data.pincode else None,
        is_active=True
    )
    db.add(company)
    db.flush()

    admin = Admin(
        finance_company_id=company.id,
        email=data.admin_email.strip().lower(),
        hashed_password=hash_password(data.admin_password),
        full_name=data.admin_name.strip(),
        mobile_number=data.admin_mobile.strip() if data.admin_mobile else None,
        role="admin",
        is_active=True
    )
    db.add(admin)

    from backend.app.models.plan import PlanFeature
    p1 = Plan(
        finance_company_id=company.id,
        name="Standard Core Banking",
        code=f"{company.code}_CORE",
        description="Essential core banking, digital accounts, and UPI subscription package.",
        price=Decimal("999.00"),
        billing_cycle="monthly",
        interest_discount_rate=Decimal("1.00"),
        is_active=True
    )
    p2 = Plan(
        finance_company_id=company.id,
        name="Premium Growth Suite",
        code=f"{company.code}_GROWTH",
        description="Comprehensive banking suite with accelerated loan processing and 2.0% interest discount.",
        price=Decimal("2499.00"),
        billing_cycle="monthly",
        interest_discount_rate=Decimal("2.00"),
        is_active=True
    )
    db.add(p1)
    db.add(p2)
    db.flush()

    db.add_all([
        PlanFeature(plan_id=p1.id, feature_key="digital_savings", feature_label="Zero-Fee Digital Accounts"),
        PlanFeature(plan_id=p1.id, feature_key="upi_transfer", feature_label="Instant IMPS & UPI Rail Access"),
        PlanFeature(plan_id=p1.id, feature_key="loan_subsidy_100", feature_label="1.00% Loan Interest Rate Subsidy"),
        PlanFeature(plan_id=p2.id, feature_key="digital_savings", feature_label="Multi-Currency Business Accounts"),
        PlanFeature(plan_id=p2.id, feature_key="priority_loans", feature_label="Priority Loan Sanctioning Queue"),
        PlanFeature(plan_id=p2.id, feature_key="loan_subsidy_200", feature_label="2.00% Loan Interest Rate Subsidy"),
        PlanFeature(plan_id=p2.id, feature_key="rm_support", feature_label="Dedicated Relationship Manager")
    ])
    db.commit()

    record_audit(
        db=db,
        actor_type="COMPANY_ONBOARDING",
        actor_id=admin.id,
        action="INSTITUTION_REGISTERED",
        entity="finance_companies",
        entity_id=company.id,
        metadata={"company_name": company.name, "gstin": company.gstin}
    )

    return CompanyRegisterResponse(
        success=True,
        message=f"{company.name} has been successfully registered on FinCore.",
        company_id=company.id,
        company_name=company.name,
        company_code=company.code,
        gstin=company.gstin,
        admin_email=admin.email
    )

@router.get("/public", response_model=List[CompanyResponse])
def get_public_companies(db: Session = Depends(get_db)):
    """Public endpoint for customer registration company selection"""
    return db.query(FinanceCompany).filter(FinanceCompany.is_active == True).all()

@router.get("", response_model=List[CompanyResponse])
def list_companies(
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if admin.role == "super_admin":
        return db.query(FinanceCompany).all()
    return db.query(FinanceCompany).filter(FinanceCompany.id == admin.finance_company_id).all()

@router.get("/{id}", response_model=CompanyResponse)
def get_company(
    id: int,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if admin.role != "super_admin" and admin.finance_company_id != id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to tenant data")

    company = db.query(FinanceCompany).filter(FinanceCompany.id == id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return company

@router.post("", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
def create_company(
    data: CompanyCreate,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if admin.role != "super_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Super Admin authorization required")

    existing = db.query(FinanceCompany).filter(
        (FinanceCompany.name == data.name) | (FinanceCompany.code == data.code)
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Company with name or code already exists")

    company = FinanceCompany(**data.model_dump())
    db.add(company)
    db.commit()
    db.refresh(company)

    record_audit(
        db=db,
        actor_type="ADMIN",
        actor_id=admin.id,
        action="CREATE_FINANCE_COMPANY",
        entity="finance_companies",
        entity_id=company.id
    )

    return company

@router.put("/{id}", response_model=CompanyResponse)
def update_company(
    id: int,
    data: CompanyUpdate,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if admin.role != "super_admin" and admin.finance_company_id != id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    company = db.query(FinanceCompany).filter(FinanceCompany.id == id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(company, key, value)

    db.commit()
    db.refresh(company)

    record_audit(
        db=db,
        actor_type="ADMIN",
        actor_id=admin.id,
        action="UPDATE_FINANCE_COMPANY",
        entity="finance_companies",
        entity_id=company.id
    )

    return company

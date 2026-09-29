from typing import List
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.loan import Loan
from backend.app.models.customer import Customer
from backend.app.models.admin import Admin
from backend.app.models.company import FinanceCompany
from backend.app.schemas.loan import (
    LoanResponse, LoanCreate, LoanRepaymentCreate, LoanRepaymentResponse,
    LoanApplyRequest, LoanLimitsResponse, LoanLimitsUpdateRequest
)
from backend.app.auth.security import get_current_customer, get_current_admin, get_current_token_payload
from backend.app.services.loan_service import create_customer_loan, process_loan_repayment, confirm_customer_loan, reject_customer_loan

router = APIRouter(prefix="/api/loans", tags=["Loans & Interest"])

@router.get("/limits", response_model=LoanLimitsResponse)
def get_loan_limits(
    payload: dict = Depends(get_current_token_payload),
    db: Session = Depends(get_db)
):
    """Retrieve the borrowing range limits for the user's finance institution"""
    company_id = payload.get("company_id")
    if not company_id:
        company = db.query(FinanceCompany).first()
    else:
        company = db.query(FinanceCompany).filter(FinanceCompany.id == company_id).first()

    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Financial institution not found")

    return LoanLimitsResponse(
        min_loan_amount=company.min_loan_amount or Decimal("25000.00"),
        max_loan_amount=company.max_loan_amount or Decimal("2500000.00"),
        company_name=company.name,
        company_id=company.id
    )

@router.put("/limits", response_model=LoanLimitsResponse)
def update_loan_limits(
    data: LoanLimitsUpdateRequest,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Allows bank administrators to configure their institution borrowing ceiling and floor"""
    company = db.query(FinanceCompany).filter(FinanceCompany.id == admin.finance_company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Financial institution not found")

    if data.min_loan_amount:
        if data.min_loan_amount < Decimal("1000.00"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Minimum loan amount cannot be less than ₹1,000")
        company.min_loan_amount = data.min_loan_amount

    if data.max_loan_amount < (company.min_loan_amount or Decimal("25000.00")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Maximum loan limit must be greater than minimum loan amount")

    company.max_loan_amount = data.max_loan_amount
    db.commit()
    db.refresh(company)

    return LoanLimitsResponse(
        min_loan_amount=company.min_loan_amount,
        max_loan_amount=company.max_loan_amount,
        company_name=company.name,
        company_id=company.id
    )


@router.get("", response_model=List[LoanResponse])
def list_loans(
    payload: dict = Depends(get_current_token_payload),
    db: Session = Depends(get_db)
):
    role = payload.get("role")
    sub_id = payload.get("sub_id")
    company_id = payload.get("company_id")

    query = db.query(Loan)

    if role == "customer":
        query = query.filter(Loan.customer_id == sub_id)
    elif role in ("admin", "super_admin"):
        if role != "super_admin" and company_id:
            query = query.filter(Loan.finance_company_id == company_id)
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")

    return query.order_by(Loan.id.desc()).all()

@router.get("/{id}", response_model=LoanResponse)
def get_loan(
    id: int,
    payload: dict = Depends(get_current_token_payload),
    db: Session = Depends(get_db)
):
    loan = db.query(Loan).filter(Loan.id == id).first()
    if not loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan not found")

    role = payload.get("role")
    sub_id = payload.get("sub_id")
    company_id = payload.get("company_id")

    if role == "customer" and loan.customer_id != sub_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if role in ("admin", "manager") and loan.finance_company_id != company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return loan

@router.post("/apply", response_model=LoanResponse, status_code=status.HTTP_201_CREATED)
def apply_for_loan(
    data: LoanApplyRequest,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    company = db.query(FinanceCompany).filter(FinanceCompany.id == customer.finance_company_id).first()
    min_limit = company.min_loan_amount if company and company.min_loan_amount else Decimal("25000.00")
    max_limit = company.max_loan_amount if company and company.max_loan_amount else Decimal("2500000.00")

    if data.principal_amount < min_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum loan amount is ₹{min_limit:,.0f}."
        )
    if data.principal_amount > max_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Requested loan amount exceeds bank maximum limit of ₹{max_limit:,.0f}."
        )

    term = data.term_months if data.term_months and data.term_months > 0 else 12
    base_rate = data.base_interest_rate if data.base_interest_rate else Decimal("12.50")
    purpose_desc = data.purpose if data.purpose else "Personal / Working Capital Finance"

    loan = create_customer_loan(
        db=db,
        customer_id=customer.id,
        principal_amount=data.principal_amount,
        base_interest_rate=base_rate,
        term_months=term,
        purpose=purpose_desc,
        initial_status="PENDING",
        document_name=data.document_name
    )
    return loan

@router.post("/{id}/confirm", response_model=LoanResponse)
def confirm_loan(
    id: int,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin verifies and confirms a pending customer loan application"""
    loan = db.query(Loan).filter(Loan.id == id).first()
    if not loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan not found")
    if admin.role != "super_admin" and loan.finance_company_id != admin.finance_company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return confirm_customer_loan(db=db, loan_id=id, admin_id=admin.id)

@router.post("/{id}/reject", response_model=LoanResponse)
def reject_loan(
    id: int,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin rejects a pending customer loan application"""
    loan = db.query(Loan).filter(Loan.id == id).first()
    if not loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan not found")
    if admin.role != "super_admin" and loan.finance_company_id != admin.finance_company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return reject_customer_loan(db=db, loan_id=id, admin_id=admin.id)

@router.post("", response_model=LoanResponse, status_code=status.HTTP_201_CREATED)
def sanction_loan(
    data: LoanCreate,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    if admin.role != "super_admin" and customer.finance_company_id != admin.finance_company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customer belongs to different finance company")

    loan = create_customer_loan(
        db=db,
        customer_id=data.customer_id,
        principal_amount=data.principal_amount,
        base_interest_rate=data.base_interest_rate,
        term_months=data.term_months,
        purpose=data.purpose or "Business Expansion / Personal Finance"
    )
    return loan

@router.post("/{id}/repay", response_model=LoanRepaymentResponse)
def submit_repayment(
    id: int,
    data: LoanRepaymentCreate,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    repayment = process_loan_repayment(
        db=db,
        loan_id=id,
        customer_id=customer.id,
        repayment_amount=data.amount
    )
    return repayment

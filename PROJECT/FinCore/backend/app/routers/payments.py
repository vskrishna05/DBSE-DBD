from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.payment import Payment
from backend.app.models.customer import Customer
from backend.app.schemas.payment import PaymentResponse, PaymentInitiateRequest
from backend.app.auth.security import get_current_customer, get_current_token_payload
from backend.app.services.payment_gateway import process_invoice_payment

router = APIRouter(prefix="/api/payments", tags=["Payments"])

@router.post("/pay", response_model=PaymentResponse)
def execute_payment(
    data: PaymentInitiateRequest,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    payment = process_invoice_payment(
        db=db,
        customer_id=customer.id,
        invoice_id=data.invoice_id,
        payment_method=data.payment_method
    )
    return payment

@router.get("", response_model=List[PaymentResponse])
def list_payments(
    payload: dict = Depends(get_current_token_payload),
    db: Session = Depends(get_db)
):
    role = payload.get("role")
    sub_id = payload.get("sub_id")
    company_id = payload.get("company_id")

    query = db.query(Payment)

    if role == "customer":
        query = query.filter(Payment.customer_id == sub_id)
    elif role in ("admin", "super_admin"):
        if role != "super_admin" and company_id:
            query = query.join(Customer).filter(Customer.finance_company_id == company_id)
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")

    return query.order_by(Payment.id.desc()).all()

@router.get("/{id}", response_model=PaymentResponse)
def get_payment(
    id: int,
    payload: dict = Depends(get_current_token_payload),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(Payment.id == id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment record not found")

    role = payload.get("role")
    sub_id = payload.get("sub_id")

    if role == "customer" and payment.customer_id != sub_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return payment

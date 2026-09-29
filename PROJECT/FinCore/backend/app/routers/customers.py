from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.customer import Customer, CustomerProfile
from backend.app.models.admin import Admin
from backend.app.models.loan import Loan, LoanInterest, LoanRepayment
from backend.app.models.payment import Payment, PaymentTransaction
from backend.app.models.invoice import Invoice, InvoiceItem
from backend.app.models.subscription import Subscription
from backend.app.models.notification import Notification
from backend.app.models.auth_support import OAuthAccount, OTPVerification
from backend.app.schemas.customer import CustomerResponse, CustomerUpdate
from backend.app.auth.security import get_current_customer, get_current_admin
from backend.app.services.audit_service import record_audit

router = APIRouter(prefix="/api/customers", tags=["Customers"])

@router.get("/me", response_model=CustomerResponse)
def get_my_profile(
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    return customer

@router.put("/me", response_model=CustomerResponse)
def update_my_profile(
    data: CustomerUpdate,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    if data.first_name is not None:
        customer.first_name = data.first_name
    if data.last_name is not None:
        customer.last_name = data.last_name

    profile = db.query(CustomerProfile).filter(CustomerProfile.customer_id == customer.id).first()
    if not profile:
        profile = CustomerProfile(customer_id=customer.id)
        db.add(profile)

    if data.phone_number is not None:
        profile.phone_number = data.phone_number
    if data.address_line1 is not None:
        profile.address_line1 = data.address_line1
    if data.city is not None:
        profile.city = data.city
    if data.state is not None:
        profile.state = data.state
    if data.postal_code is not None:
        profile.postal_code = data.postal_code
    if data.country is not None:
        profile.country = data.country

    db.commit()
    db.refresh(customer)

    record_audit(
        db=db,
        actor_type="CUSTOMER",
        actor_id=customer.id,
        action="UPDATE_PROFILE",
        entity="customers",
        entity_id=customer.id
    )

    return customer

@router.get("", response_model=List[CustomerResponse])
def list_customers(
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Customer)
    if admin.role != "super_admin":
        query = query.filter(Customer.finance_company_id == admin.finance_company_id)
    return query.order_by(Customer.id.desc()).all()

@router.get("/{id}", response_model=CustomerResponse)
def get_customer_by_id(
    id: int,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    if admin.role != "super_admin" and customer.finance_company_id != admin.finance_company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return customer

@router.put("/{id}/toggle-status")
def toggle_customer_status(
    id: int,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    if admin.role != "super_admin" and customer.finance_company_id != admin.finance_company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    customer.is_active = not customer.is_active
    db.commit()
    db.refresh(customer)

    status_str = "ACTIVE" if customer.is_active else "SUSPENDED"
    record_audit(
        db=db,
        actor_type="ADMIN",
        actor_id=admin.id,
        action=f"CUSTOMER_STATUS_CHANGED_{status_str}",
        entity="customers",
        entity_id=customer.id
    )

    return {
        "success": True,
        "message": f"Customer account has been {status_str.lower()}.",
        "is_active": customer.is_active
    }

@router.delete("/{id}")
def delete_customer(
    id: int,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    if admin.role != "super_admin" and customer.finance_company_id != admin.finance_company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    cust_name = f"{customer.first_name} {customer.last_name}"
    cust_email = customer.email
    cust_phone = customer.mobile_number

    # 1. Cascade Payments
    payments = db.query(Payment).filter(Payment.customer_id == id).all()
    for p in payments:
        db.query(PaymentTransaction).filter(PaymentTransaction.payment_id == p.id).delete(synchronize_session=False)
        db.delete(p)

    # 2. Cascade Invoices
    invoices = db.query(Invoice).filter(Invoice.customer_id == id).all()
    for inv in invoices:
        db.query(InvoiceItem).filter(InvoiceItem.invoice_id == inv.id).delete(synchronize_session=False)
        db.delete(inv)

    # 3. Cascade Loans
    loans = db.query(Loan).filter(Loan.customer_id == id).all()
    for l in loans:
        db.query(LoanInterest).filter(LoanInterest.loan_id == l.id).delete(synchronize_session=False)
        db.query(LoanRepayment).filter(LoanRepayment.loan_id == l.id).delete(synchronize_session=False)
        db.delete(l)

    # 4. Cascade Subscriptions & Notifications
    db.query(Subscription).filter(Subscription.customer_id == id).delete(synchronize_session=False)
    db.query(Notification).filter(Notification.customer_id == id).delete(synchronize_session=False)

    # 5. Cascade OAuth Accounts & Profile
    db.query(OAuthAccount).filter(OAuthAccount.customer_id == id).delete(synchronize_session=False)
    db.query(CustomerProfile).filter(CustomerProfile.customer_id == id).delete(synchronize_session=False)

    # 6. Delete OTP records
    if cust_email:
        db.query(OTPVerification).filter(OTPVerification.email == cust_email).delete(synchronize_session=False)
    if cust_phone:
        db.query(OTPVerification).filter(OTPVerification.email == cust_phone).delete(synchronize_session=False)

    # 7. Delete Customer
    db.delete(customer)
    db.commit()

    record_audit(
        db=db,
        actor_type="ADMIN",
        actor_id=admin.id,
        action="DELETE_CUSTOMER",
        entity="customers",
        metadata={"deleted_customer_email": cust_email, "name": cust_name}
    )

    return {
        "success": True,
        "message": f"Customer account '{cust_name}' and all associated records have been permanently removed."
    }

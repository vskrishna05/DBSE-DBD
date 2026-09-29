import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.models.loan import Loan, LoanInterest, LoanRepayment
from backend.app.models.customer import Customer
from backend.app.models.subscription import Subscription
from backend.app.models.plan import Plan
from backend.app.services.notification_service import create_notification
from backend.app.services.audit_service import record_audit

def create_customer_loan(
    db: Session,
    customer_id: int,
    principal_amount: Decimal,
    base_interest_rate: Decimal,
    term_months: int,
    purpose: str = "Working Capital / Business Expansion",
    initial_status: str = "ACTIVE",
    document_name: str = None
) -> Loan:
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    # Check for active subscription to compute discount benefit
    active_sub = db.query(Subscription).filter(
        Subscription.customer_id == customer_id,
        Subscription.status == "active"
    ).first()

    discount_rate = Decimal("0.00")
    if active_sub:
        plan = db.query(Plan).filter(Plan.id == active_sub.plan_id).first()
        if plan and plan.interest_discount_rate:
            discount_rate = Decimal(str(plan.interest_discount_rate))

    effective_rate = max(Decimal("0.50"), base_interest_rate - discount_rate)

    year = datetime.utcnow().strftime("%Y")
    count = db.query(Loan).count() + 1
    loan_acc = f"LN-{year}-{count:05d}"

    full_purpose = purpose
    if document_name:
        full_purpose = f"{purpose} [Docs: {document_name}]"

    # Monthly initial interest component calculation: (P * R / 12)
    monthly_interest = (principal_amount * (effective_rate / Decimal("100.00")) / Decimal("12")).quantize(Decimal("0.01")) if initial_status == "ACTIVE" else Decimal("0.00")

    loan = Loan(
        loan_account_number=loan_acc,
        customer_id=customer_id,
        finance_company_id=customer.finance_company_id,
        principal_amount=principal_amount,
        base_interest_rate=base_interest_rate,
        discount_rate=discount_rate,
        effective_interest_rate=effective_rate,
        term_months=term_months,
        purpose=full_purpose,
        current_balance=principal_amount,
        total_interest_accrued=monthly_interest,
        total_paid=Decimal("0.00"),
        status=initial_status
    )
    db.add(loan)
    db.flush()

    if initial_status == "ACTIVE":
        # Initial interest record
        interest_record = LoanInterest(
            loan_id=loan.id,
            calculation_date=datetime.utcnow(),
            interest_amount=monthly_interest,
            is_paid=False
        )
        db.add(interest_record)

    db.commit()
    db.refresh(loan)

    if initial_status == "ACTIVE":
        create_notification(
            db=db,
            customer_id=customer_id,
            title="Loan Sanctioned",
            message=f"Loan account {loan.loan_account_number} for ₹{principal_amount:,.2f} has been approved at {effective_rate:.2f}% interest.",
            notification_type="LOAN"
        )
    else:
        create_notification(
            db=db,
            customer_id=customer_id,
            title="Loan Application Received",
            message=f"Loan facility application {loan.loan_account_number} for ₹{principal_amount:,.2f} submitted. Status: Pending for Verification.",
            notification_type="LOAN"
        )

    record_audit(
        db=db,
        actor_type="CUSTOMER" if initial_status == "PENDING" else "ADMIN",
        action="LOAN_APPLICATION_SUBMITTED" if initial_status == "PENDING" else "LOAN_SANCTIONED",
        entity="loans",
        entity_id=loan.id,
        metadata={
            "loan_account": loan.loan_account_number,
            "principal": str(principal_amount),
            "effective_rate": str(effective_rate),
            "status": initial_status
        }
    )

    return loan

def confirm_customer_loan(db: Session, loan_id: int, admin_id: int) -> Loan:
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan not found")
    if loan.status != "PENDING":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Loan is already {loan.status}")

    monthly_interest = (loan.principal_amount * (loan.effective_interest_rate / Decimal("100.00")) / Decimal("12")).quantize(Decimal("0.01"))
    loan.status = "ACTIVE"
    loan.total_interest_accrued = monthly_interest
    loan.disbursed_at = datetime.utcnow()

    interest_record = LoanInterest(
        loan_id=loan.id,
        calculation_date=datetime.utcnow(),
        interest_amount=monthly_interest,
        is_paid=False
    )
    db.add(interest_record)
    db.commit()
    db.refresh(loan)

    create_notification(
        db=db,
        customer_id=loan.customer_id,
        title="Loan Confirmed & Sanctioned",
        message=f"Your loan {loan.loan_account_number} for ₹{loan.principal_amount:,.2f} has been verified and confirmed by the bank administrator!",
        notification_type="LOAN"
    )

    record_audit(
        db=db,
        actor_type="ADMIN",
        actor_id=admin_id,
        action="LOAN_CONFIRMED_AND_DISBURSED",
        entity="loans",
        entity_id=loan.id,
        metadata={"loan_account": loan.loan_account_number, "status": "ACTIVE"}
    )
    return loan

def reject_customer_loan(db: Session, loan_id: int, admin_id: int, reason: str = "Documentation verification criteria not met") -> Loan:
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan not found")
    if loan.status != "PENDING":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot reject loan with status {loan.status}")

    loan.status = "REJECTED"
    db.commit()
    db.refresh(loan)

    create_notification(
        db=db,
        customer_id=loan.customer_id,
        title="Loan Application Rejected",
        message=f"Your loan request {loan.loan_account_number} was rejected. Note: {reason}",
        notification_type="LOAN"
    )

    record_audit(
        db=db,
        actor_type="ADMIN",
        actor_id=admin_id,
        action="LOAN_APPLICATION_REJECTED",
        entity="loans",
        entity_id=loan.id,
        metadata={"reason": reason}
    )
    return loan

def process_loan_repayment(
    db: Session,
    loan_id: int,
    customer_id: int,
    repayment_amount: Decimal
) -> LoanRepayment:
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.customer_id == customer_id).first()
    if not loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan account not found")

    if loan.status != "ACTIVE":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Loan is in {loan.status} status")

    repayment_amount = Decimal(str(repayment_amount)).quantize(Decimal("0.01"))
    if repayment_amount <= Decimal("0.00"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Repayment amount must be positive")

    # Distribute repayment: Outstanding interest is serviced first, balance reduces principal
    unpaid_interests = db.query(LoanInterest).filter(
        LoanInterest.loan_id == loan.id,
        LoanInterest.is_paid == False
    ).order_by(LoanInterest.calculation_date.asc()).all()

    remaining_payment = repayment_amount
    interest_component = Decimal("0.00")

    for item in unpaid_interests:
        due = Decimal(str(item.interest_amount))
        if remaining_payment >= due:
            item.is_paid = True
            interest_component += due
            remaining_payment -= due
        else:
            # Partially cover interest
            item.interest_amount = due - remaining_payment
            interest_component += remaining_payment
            remaining_payment = Decimal("0.00")
            break

    principal_component = remaining_payment
    current_bal = Decimal(str(loan.current_balance))

    if principal_component > current_bal:
        # Excess payment
        principal_component = current_bal
        new_balance = Decimal("0.00")
        loan.status = "PAID_OFF"
    else:
        new_balance = current_bal - principal_component
        if new_balance <= Decimal("0.00"):
            new_balance = Decimal("0.00")
            loan.status = "PAID_OFF"

    loan.current_balance = new_balance
    loan.total_paid = (Decimal(str(loan.total_paid)) + repayment_amount).quantize(Decimal("0.01"))

    repayment = LoanRepayment(
        loan_id=loan.id,
        amount=repayment_amount,
        principal_component=principal_component,
        interest_component=interest_component,
        repayment_date=datetime.utcnow()
    )
    db.add(repayment)
    db.commit()
    db.refresh(repayment)

    create_notification(
        db=db,
        customer_id=customer_id,
        title="Loan Repayment Processed",
        message=f"Repayment of ${repayment_amount:.2f} recorded for loan {loan.loan_account_number}. Remaining balance: ${new_balance:.2f}.",
        notification_type="LOAN"
    )

    record_audit(
        db=db,
        actor_type="CUSTOMER",
        actor_id=customer_id,
        action="LOAN_REPAYMENT",
        entity="loans",
        entity_id=loan.id,
        metadata={
            "loan_account": loan.loan_account_number,
            "amount": str(repayment_amount),
            "new_balance": str(new_balance)
        }
    )

    return repayment

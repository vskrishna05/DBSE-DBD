import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.config import settings
from backend.app.models.payment import Payment, PaymentTransaction
from backend.app.models.invoice import Invoice
from backend.app.models.subscription import Subscription
from backend.app.models.plan import Plan
from backend.app.services.notification_service import create_notification
from backend.app.services.audit_service import record_audit

def process_invoice_payment(
    db: Session,
    customer_id: int,
    invoice_id: int,
    payment_method: str = "CREDIT_CARD",
    simulate_failure: bool = False
) -> Payment:
    # 1. Fetch and validate invoice
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.customer_id == customer_id
    ).first()

    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

    if invoice.status == "PAID":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invoice is already paid")

    if invoice.status == "CANCELLED":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot pay a cancelled invoice")

    payment_ref = f"PAY-{datetime.utcnow().strftime('%Y%m')}-{uuid.uuid4().hex[:8].upper()}"
    payable_amount = Decimal(str(invoice.total_amount))

    # ACID Transaction Start
    try:
        if simulate_failure:
            payment = Payment(
                payment_reference=payment_ref,
                invoice_id=invoice.id,
                customer_id=customer_id,
                amount=payable_amount,
                status="FAILED",
                payment_method=payment_method,
                payment_date=datetime.utcnow()
            )
            db.add(payment)
            db.flush()

            txn = PaymentTransaction(
                payment_id=payment.id,
                gateway_transaction_id=f"TXN_FAILED_{uuid.uuid4().hex[:12]}",
                gateway_response='{"status": "DECLINED", "reason": "Insufficient sandbox funds or test decline"}'
            )
            db.add(txn)
            db.commit()

            create_notification(
                db=db,
                customer_id=customer_id,
                title="Payment Failed",
                message=f"Payment for invoice #{invoice.invoice_number} could not be completed.",
                notification_type="BILLING"
            )

            record_audit(
                db=db,
                actor_type="CUSTOMER",
                actor_id=customer_id,
                action="PAYMENT_FAILED",
                entity="payments",
                entity_id=payment.id,
                metadata={"invoice_id": invoice.id, "amount": str(payable_amount)}
            )

            return payment

        # Successful payment settlement
        payment = Payment(
            payment_reference=payment_ref,
            invoice_id=invoice.id,
            customer_id=customer_id,
            amount=payable_amount,
            status="SUCCESS",
            payment_method=payment_method,
            payment_date=datetime.utcnow()
        )
        db.add(payment)
        db.flush()

        gateway_txn_id = f"TXN_{settings.PAYMENT_PROVIDER.upper()}_{uuid.uuid4().hex[:12].upper()}"
        txn = PaymentTransaction(
            payment_id=payment.id,
            gateway_transaction_id=gateway_txn_id,
            gateway_response=f'{{"provider": "{settings.PAYMENT_PROVIDER}", "status": "SETTLED", "auth_code": "AUTH_OK_2026"}}'
        )
        db.add(txn)

        # Update invoice state
        invoice.status = "PAID"
        invoice.paid_date = datetime.utcnow()

        # If linked to a subscription, update active dates
        if invoice.subscription_id:
            sub = db.query(Subscription).filter(Subscription.id == invoice.subscription_id).first()
            if sub:
                sub.status = "active"
                plan = db.query(Plan).filter(Plan.id == sub.plan_id).first()
                cycle_days = 365 if (plan and plan.billing_cycle == "annual") else (90 if (plan and plan.billing_cycle == "quarterly") else 30)
                sub.end_date = datetime.utcnow() + timedelta(days=cycle_days)

        db.commit()
        db.refresh(payment)

        # Notify Customer
        create_notification(
            db=db,
            customer_id=customer_id,
            title="Payment Successful",
            message=f"Your payment of ${payable_amount:.2f} for invoice #{invoice.invoice_number} was successfully settled.",
            notification_type="BILLING"
        )

        # Non-repudiation Audit
        record_audit(
            db=db,
            actor_type="CUSTOMER",
            actor_id=customer_id,
            action="PAYMENT_SUCCESS",
            entity="payments",
            entity_id=payment.id,
            metadata={
                "payment_ref": payment_ref,
                "invoice_number": invoice.invoice_number,
                "amount": str(payable_amount),
                "gateway_id": gateway_txn_id
            }
        )

        return payment

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment transaction failed: {str(e)}"
        )

from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.subscription import Subscription
from backend.app.models.plan import Plan
from backend.app.models.customer import Customer
from backend.app.models.admin import Admin
from backend.app.schemas.subscription import SubscriptionResponse, SubscriptionCreate
from backend.app.auth.security import get_current_customer, get_current_admin
from backend.app.services.billing_service import create_subscription_invoice
from backend.app.services.notification_service import create_notification
from backend.app.services.audit_service import record_audit

router = APIRouter(prefix="/api/subscriptions", tags=["Subscriptions"])

@router.get("/active", response_model=Optional[SubscriptionResponse])
def get_active_subscription(
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    sub = db.query(Subscription).filter(
        Subscription.customer_id == customer.id,
        Subscription.status == "active"
    ).order_by(Subscription.id.desc()).first()
    return sub

@router.get("/history", response_model=List[SubscriptionResponse])
def get_subscription_history(
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    return db.query(Subscription).filter(
        Subscription.customer_id == customer.id
    ).order_by(Subscription.id.desc()).all()

@router.post("/subscribe", response_model=dict)
def subscribe_to_plan(
    data: SubscriptionCreate,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    # 1. Validate plan belongs to customer's finance company and is active
    plan = db.query(Plan).filter(
        Plan.id == data.plan_id,
        Plan.finance_company_id == customer.finance_company_id,
        Plan.is_active == True
    ).first()

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found or unavailable for your finance company"
        )

    # 2. Deactivate previous active subscription if upgrading/changing
    db.query(Subscription).filter(
        Subscription.customer_id == customer.id,
        Subscription.status == "active"
    ).update({"status": "cancelled"})

    # 3. Create new subscription (initial status is 'pending_payment' or 'active' once invoice settled)
    cycle_days = 365 if plan.billing_cycle == "annual" else (90 if plan.billing_cycle == "quarterly" else 30)
    start_date = datetime.utcnow()
    end_date = start_date + timedelta(days=cycle_days)

    subscription = Subscription(
        customer_id=customer.id,
        plan_id=plan.id,
        status="active",
        start_date=start_date,
        end_date=end_date,
        auto_renew=data.auto_renew
    )
    db.add(subscription)
    db.flush()

    # 4. Generate first invoice
    invoice = create_subscription_invoice(db=db, subscription=subscription)

    db.commit()
    db.refresh(subscription)

    create_notification(
        db=db,
        customer_id=customer.id,
        title="Subscription Activated",
        message=f"You have subscribed to {plan.name} plan. Invoice #{invoice.invoice_number} is ready for payment.",
        notification_type="BILLING"
    )

    record_audit(
        db=db,
        actor_type="CUSTOMER",
        actor_id=customer.id,
        action="SUBSCRIBE_TO_PLAN",
        entity="subscriptions",
        entity_id=subscription.id,
        metadata={"plan_id": plan.id, "plan_name": plan.name, "invoice_id": invoice.id}
    )

    return {
        "success": True,
        "subscription_id": subscription.id,
        "invoice_id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "amount_due": float(invoice.total_amount),
        "message": f"Successfully subscribed to {plan.name}. Please settle Invoice #{invoice.invoice_number}."
    }

@router.post("/cancel", response_model=dict)
def cancel_subscription(
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    sub = db.query(Subscription).filter(
        Subscription.customer_id == customer.id,
        Subscription.status == "active"
    ).first()

    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active subscription found to cancel")

    sub.status = "cancelled"
    sub.auto_renew = False
    db.commit()

    create_notification(
        db=db,
        customer_id=customer.id,
        title="Subscription Cancelled",
        message="Your subscription has been cancelled and will not renew.",
        notification_type="BILLING"
    )

    record_audit(
        db=db,
        actor_type="CUSTOMER",
        actor_id=customer.id,
        action="CANCEL_SUBSCRIPTION",
        entity="subscriptions",
        entity_id=sub.id
    )

    return {"success": True, "message": "Subscription cancelled successfully"}

@router.get("/admin/all", response_model=List[SubscriptionResponse])
def get_all_subscriptions(
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Subscription).join(Customer)
    if admin.role != "super_admin":
        query = query.filter(Customer.finance_company_id == admin.finance_company_id)
    return query.order_by(Subscription.id.desc()).all()

from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app.models.customer import Customer
from backend.app.models.admin import Admin
from backend.app.models.subscription import Subscription
from backend.app.models.invoice import Invoice
from backend.app.models.payment import Payment
from backend.app.models.loan import Loan
from backend.app.models.plan import Plan
from backend.app.models.company import FinanceCompany
from backend.app.auth.security import get_current_customer, get_current_admin

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Reporting"])

@router.get("/customer-summary")
def get_customer_summary(
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    # Active Subscription
    active_sub = db.query(Subscription).filter(
        Subscription.customer_id == customer.id,
        Subscription.status == "active"
    ).order_by(Subscription.id.desc()).first()

    current_plan = None
    if active_sub:
        plan = db.query(Plan).filter(Plan.id == active_sub.plan_id).first()
        if plan:
            current_plan = {
                "id": plan.id,
                "name": plan.name,
                "price": float(plan.price),
                "billing_cycle": plan.billing_cycle,
                "interest_discount_rate": float(plan.interest_discount_rate),
                "renewal_date": active_sub.end_date.isoformat()
            }

    # Upcoming / Pending Invoices
    pending_invoices = db.query(Invoice).filter(
        Invoice.customer_id == customer.id,
        Invoice.status.in_(["ISSUED", "PENDING", "OVERDUE"])
    ).order_by(Invoice.due_date.asc()).all()

    total_outstanding = sum(Decimal(str(inv.total_amount)) for inv in pending_invoices)
    next_due_invoice = pending_invoices[0] if pending_invoices else None

    # Active Loan
    active_loan = db.query(Loan).filter(
        Loan.customer_id == customer.id,
        Loan.status == "ACTIVE"
    ).order_by(Loan.id.desc()).first()

    loan_info = None
    if active_loan:
        loan_info = {
            "id": active_loan.id,
            "loan_account_number": active_loan.loan_account_number,
            "principal_amount": float(active_loan.principal_amount),
            "current_balance": float(active_loan.current_balance),
            "effective_interest_rate": float(active_loan.effective_interest_rate),
            "total_interest_accrued": float(active_loan.total_interest_accrued),
            "total_paid": float(active_loan.total_paid),
            "term_months": active_loan.term_months,
            "status": active_loan.status
        }

    # Recent Invoices
    recent_invoices = db.query(Invoice).filter(
        Invoice.customer_id == customer.id
    ).order_by(Invoice.id.desc()).limit(5).all()

    # Recent Payments
    recent_payments = db.query(Payment).filter(
        Payment.customer_id == customer.id
    ).order_by(Payment.id.desc()).limit(5).all()

    # Monthly Billing Trends for Charts (Last 6 months)
    monthly_trends = []
    now = datetime.utcnow()
    for i in range(5, -1, -1):
        target_month_date = now - timedelta(days=i * 30)
        month_label = target_month_date.strftime("%b %Y")
        
        # Calculate monthly total billed and paid
        monthly_billed = db.query(func.coalesce(func.sum(Invoice.total_amount), 0)).filter(
            Invoice.customer_id == customer.id,
            func.month(Invoice.created_at) == target_month_date.month,
            func.year(Invoice.created_at) == target_month_date.year
        ).scalar()

        monthly_paid = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(
            Payment.customer_id == customer.id,
            Payment.status == "SUCCESS",
            func.month(Payment.payment_date) == target_month_date.month,
            func.year(Payment.payment_date) == target_month_date.year
        ).scalar()

        monthly_trends.append({
            "month": month_label,
            "billed": float(monthly_billed),
            "paid": float(monthly_paid)
        })

    company = db.query(FinanceCompany).filter(FinanceCompany.id == customer.finance_company_id).first()

    return {
        "customer": {
            "id": customer.id,
            "full_name": f"{customer.first_name} {customer.last_name}",
            "email": customer.email,
            "company_name": company.name if company else "FinCore",
            "is_verified": customer.is_verified
        },
        "subscription": current_plan,
        "total_outstanding": float(total_outstanding),
        "next_payment_due": {
            "invoice_id": next_due_invoice.id if next_due_invoice else None,
            "invoice_number": next_due_invoice.invoice_number if next_due_invoice else None,
            "amount": float(next_due_invoice.total_amount) if next_due_invoice else 0.0,
            "due_date": next_due_invoice.due_date.isoformat() if next_due_invoice else None
        } if next_due_invoice else None,
        "loan": loan_info,
        "recent_invoices": [
            {
                "id": inv.id,
                "invoice_number": inv.invoice_number,
                "amount": float(inv.total_amount),
                "status": inv.status,
                "due_date": inv.due_date.isoformat()
            } for inv in recent_invoices
        ],
        "recent_payments": [
            {
                "id": p.id,
                "payment_reference": p.payment_reference,
                "amount": float(p.amount),
                "status": p.status,
                "payment_method": p.payment_method,
                "date": p.payment_date.isoformat()
            } for p in recent_payments
        ],
        "monthly_trends": monthly_trends
    }

@router.get("/admin-summary")
def get_admin_summary(
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    company_id = admin.finance_company_id
    is_super = (admin.role == "super_admin")

    cust_q = db.query(Customer)
    sub_q = db.query(Subscription).join(Customer)
    inv_q = db.query(Invoice)
    loan_q = db.query(Loan)
    pay_q = db.query(Payment).join(Invoice)

    if not is_super:
        cust_q = cust_q.filter(Customer.finance_company_id == company_id)
        sub_q = sub_q.filter(Customer.finance_company_id == company_id)
        inv_q = inv_q.filter(Invoice.finance_company_id == company_id)
        loan_q = loan_q.filter(Loan.finance_company_id == company_id)
        pay_q = pay_q.filter(Invoice.finance_company_id == company_id)

    total_customers = cust_q.count()
    active_subscriptions = sub_q.filter(Subscription.status == "active").count()
    
    total_revenue = pay_q.filter(Payment.status == "SUCCESS").with_entities(
        func.coalesce(func.sum(Payment.amount), 0)
    ).scalar()

    pending_invoices_count = inv_q.filter(Invoice.status.in_(["ISSUED", "PENDING", "OVERDUE"])).count()
    pending_amount = inv_q.filter(Invoice.status.in_(["ISSUED", "PENDING", "OVERDUE"])).with_entities(
        func.coalesce(func.sum(Invoice.total_amount), 0)
    ).scalar()

    active_loans_count = loan_q.filter(Loan.status == "ACTIVE").count()
    total_loan_outstanding = loan_q.filter(Loan.status == "ACTIVE").with_entities(
        func.coalesce(func.sum(Loan.current_balance), 0)
    ).scalar()

    total_interest_accrued = loan_q.with_entities(
        func.coalesce(func.sum(Loan.total_interest_accrued), 0)
    ).scalar()

    # Recent Transactions
    recent_transactions = pay_q.order_by(Payment.id.desc()).limit(10).all()

    # Monthly Revenue Trend for Charts
    monthly_revenue = []
    now = datetime.utcnow()
    for i in range(5, -1, -1):
        target = now - timedelta(days=i * 30)
        label = target.strftime("%b %Y")

        rev = pay_q.filter(
            Payment.status == "SUCCESS",
            func.month(Payment.payment_date) == target.month,
            func.year(Payment.payment_date) == target.year
        ).with_entities(func.coalesce(func.sum(Payment.amount), 0)).scalar()

        monthly_revenue.append({
            "month": label,
            "revenue": float(rev)
        })

    company = db.query(FinanceCompany).filter(FinanceCompany.id == company_id).first()

    return {
        "company_name": company.name if company else "Global Operations",
        "total_customers": total_customers,
        "active_subscriptions": active_subscriptions,
        "total_revenue": float(total_revenue),
        "pending_invoices_count": pending_invoices_count,
        "pending_invoices_amount": float(pending_amount),
        "active_loans_count": active_loans_count,
        "total_loan_outstanding": float(total_loan_outstanding),
        "total_interest_accrued": float(total_interest_accrued),
        "monthly_revenue_trend": monthly_revenue,
        "recent_transactions": [
            {
                "id": p.id,
                "payment_reference": p.payment_reference,
                "invoice_id": p.invoice_id,
                "customer_id": p.customer_id,
                "amount": float(p.amount),
                "status": p.status,
                "payment_method": p.payment_method,
                "date": p.payment_date.isoformat()
            } for p in recent_transactions
        ]
    }

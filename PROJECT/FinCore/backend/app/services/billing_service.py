import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from backend.app.models.invoice import Invoice, InvoiceItem
from backend.app.models.subscription import Subscription
from backend.app.models.plan import Plan
from backend.app.models.customer import Customer
from backend.app.models.company import FinanceCompany
from backend.app.services.notification_service import create_notification
from backend.app.services.audit_service import record_audit

def generate_invoice_number(db: Session, company_code: str) -> str:
    year = datetime.utcnow().strftime("%Y")
    count = db.query(Invoice).count() + 1
    random_suffix = uuid.uuid4().hex[:4].upper()
    return f"INV-{company_code.upper()}-{year}-{count:04d}-{random_suffix}"

def create_subscription_invoice(db: Session, subscription: Subscription) -> Invoice:
    plan = db.query(Plan).filter(Plan.id == subscription.plan_id).first()
    customer = db.query(Customer).filter(Customer.id == subscription.customer_id).first()
    company = db.query(FinanceCompany).filter(FinanceCompany.id == customer.finance_company_id).first()

    subtotal = Decimal(str(plan.price))
    tax_rate = Decimal("0.05")  # 5% regulatory fintech tax
    tax_amount = (subtotal * tax_rate).quantize(Decimal("0.01"))
    discount_amount = Decimal("0.00")
    total_amount = subtotal + tax_amount - discount_amount

    inv_number = generate_invoice_number(db, company.code if company else "FC")
    due_date = datetime.utcnow() + timedelta(days=14)

    invoice = Invoice(
        invoice_number=inv_number,
        customer_id=customer.id,
        finance_company_id=customer.finance_company_id,
        subscription_id=subscription.id,
        status="ISSUED",
        subtotal=subtotal,
        tax_amount=tax_amount,
        discount_amount=discount_amount,
        total_amount=total_amount,
        due_date=due_date
    )
    db.add(invoice)
    db.flush()

    item = InvoiceItem(
        invoice_id=invoice.id,
        description=f"{plan.name} Subscription ({plan.billing_cycle.capitalize()})",
        quantity=1,
        unit_price=subtotal,
        line_total=subtotal
    )
    db.add(item)
    db.commit()
    db.refresh(invoice)

    # In-app notification
    create_notification(
        db=db,
        customer_id=customer.id,
        title="New Invoice Issued",
        message=f"Invoice #{invoice.invoice_number} for ${total_amount:.2f} has been generated.",
        notification_type="BILLING"
    )

    # Audit log
    record_audit(
        db=db,
        actor_type="SYSTEM",
        action="INVOICE_GENERATED",
        entity="invoices",
        entity_id=invoice.id,
        metadata={"invoice_number": invoice.invoice_number, "total": str(total_amount)}
    )

    return invoice

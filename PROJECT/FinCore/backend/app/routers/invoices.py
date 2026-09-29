from typing import List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.invoice import Invoice, InvoiceItem
from backend.app.models.customer import Customer
from backend.app.models.admin import Admin
from backend.app.schemas.invoice import InvoiceResponse, InvoiceCreate
from backend.app.auth.security import get_current_token_payload, get_current_admin
from backend.app.services.billing_service import generate_invoice_number
from backend.app.services.audit_service import record_audit

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])

@router.get("", response_model=List[InvoiceResponse])
def list_invoices(
    status_filter: Optional[str] = None,
    payload: dict = Depends(get_current_token_payload),
    db: Session = Depends(get_db)
):
    role = payload.get("role")
    sub_id = payload.get("sub_id")
    company_id = payload.get("company_id")

    query = db.query(Invoice)

    if role == "customer":
        query = query.filter(Invoice.customer_id == sub_id)
    elif role in ("admin", "super_admin"):
        if role != "super_admin" and company_id:
            query = query.filter(Invoice.finance_company_id == company_id)
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")

    if status_filter:
        query = query.filter(Invoice.status == status_filter.upper())

    return query.order_by(Invoice.id.desc()).all()

@router.get("/{id}", response_model=InvoiceResponse)
def get_invoice(
    id: int,
    payload: dict = Depends(get_current_token_payload),
    db: Session = Depends(get_db)
):
    role = payload.get("role")
    sub_id = payload.get("sub_id")
    company_id = payload.get("company_id")

    invoice = db.query(Invoice).filter(Invoice.id == id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

    if role == "customer" and invoice.customer_id != sub_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if role in ("admin", "manager") and invoice.finance_company_id != company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return invoice

@router.post("", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
def create_custom_invoice(
    data: InvoiceCreate,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    if admin.role != "super_admin" and customer.finance_company_id != admin.finance_company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customer belongs to different company")

    subtotal = sum(Decimal(str(item.line_total)) for item in data.items)
    tax_amount = (subtotal * Decimal("0.05")).quantize(Decimal("0.01"))
    total_amount = subtotal + tax_amount

    inv_num = generate_invoice_number(db, "CUST")
    due_date = data.due_date or (datetime.utcnow() + timedelta(days=14))

    invoice = Invoice(
        invoice_number=inv_num,
        customer_id=customer.id,
        finance_company_id=customer.finance_company_id,
        subscription_id=data.subscription_id,
        status="ISSUED",
        subtotal=subtotal,
        tax_amount=tax_amount,
        discount_amount=Decimal("0.00"),
        total_amount=total_amount,
        due_date=due_date
    )
    db.add(invoice)
    db.flush()

    for item in data.items:
        inv_item = InvoiceItem(
            invoice_id=invoice.id,
            description=item.description,
            quantity=item.quantity,
            unit_price=item.unit_price,
            line_total=item.line_total
        )
        db.add(inv_item)

    db.commit()
    db.refresh(invoice)

    record_audit(
        db=db,
        actor_type="ADMIN",
        actor_id=admin.id,
        action="CREATE_INVOICE",
        entity="invoices",
        entity_id=invoice.id,
        metadata={"invoice_number": inv_num, "total": str(total_amount)}
    )

    return invoice

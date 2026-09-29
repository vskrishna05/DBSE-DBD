from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class InvoiceItemBase(BaseModel):
    description: str
    quantity: int = 1
    unit_price: Decimal
    line_total: Decimal

class InvoiceItemResponse(InvoiceItemBase):
    id: int
    invoice_id: int
    model_config = ConfigDict(from_attributes=True)

class InvoiceBase(BaseModel):
    customer_id: int
    finance_company_id: int
    subscription_id: Optional[int] = None
    status: str = "ISSUED"
    subtotal: Decimal
    tax_amount: Decimal = Decimal("0.00")
    discount_amount: Decimal = Decimal("0.00")
    total_amount: Decimal
    due_date: datetime

class InvoiceCreate(BaseModel):
    customer_id: int
    subscription_id: Optional[int] = None
    due_date: Optional[datetime] = None
    items: List[InvoiceItemBase]

class InvoiceResponse(InvoiceBase):
    id: int
    invoice_number: str
    paid_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    items: List[InvoiceItemResponse] = []

    model_config = ConfigDict(from_attributes=True)

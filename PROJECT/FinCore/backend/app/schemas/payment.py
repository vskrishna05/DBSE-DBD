from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict

class PaymentInitiateRequest(BaseModel):
    invoice_id: int
    amount: Optional[Decimal] = None
    payment_method: str = "CREDIT_CARD"

class PaymentResponse(BaseModel):
    id: int
    payment_reference: str
    invoice_id: int
    customer_id: int
    amount: Decimal
    status: str
    payment_method: str
    payment_date: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class CustomerProfileBase(BaseModel):
    phone_number: Optional[str] = None
    address_line1: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = "United States"
    credit_score: Optional[int] = 700

class CustomerProfileResponse(CustomerProfileBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CustomerResponse(BaseModel):
    id: int
    finance_company_id: int
    email: EmailStr
    first_name: str
    last_name: str
    is_verified: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    profile: Optional[CustomerProfileResponse] = None

    model_config = ConfigDict(from_attributes=True)

class CustomerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    address_line1: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None

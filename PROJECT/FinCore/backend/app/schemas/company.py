from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class CompanyBase(BaseModel):
    name: str
    code: str
    license_number: str
    contact_email: str
    contact_phone: str
    gstin: Optional[str] = None
    pan_number: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    is_active: bool = True

class CompanyCreate(CompanyBase):
    pass

class CompanyRegisterRequest(BaseModel):
    name: str
    code: str
    license_number: str
    gstin: str
    pan_number: Optional[str] = None
    contact_email: str
    contact_phone: str
    address: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    admin_name: str
    admin_email: str
    admin_password: str
    admin_mobile: Optional[str] = None

class CompanyRegisterResponse(BaseModel):
    success: bool
    message: str
    company_id: int
    company_name: str
    company_code: str
    gstin: Optional[str]
    admin_email: str

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    gstin: Optional[str] = None
    pan_number: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    is_active: Optional[bool] = None

class CompanyResponse(CompanyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

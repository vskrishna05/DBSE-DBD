from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class AdminBase(BaseModel):
    finance_company_id: int
    email: EmailStr
    full_name: str
    role: str = "admin"
    is_active: bool = True

class AdminCreate(AdminBase):
    password: str

class AdminResponse(AdminBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

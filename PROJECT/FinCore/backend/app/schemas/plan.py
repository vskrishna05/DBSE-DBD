from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class PlanFeatureBase(BaseModel):
    feature_key: str
    feature_label: str
    is_included: bool = True

class PlanFeatureResponse(PlanFeatureBase):
    id: int
    plan_id: int
    model_config = ConfigDict(from_attributes=True)

class PlanBase(BaseModel):
    finance_company_id: int
    name: str
    code: str
    description: Optional[str] = None
    price: Decimal
    billing_cycle: str = "monthly"
    interest_discount_rate: Decimal = Decimal("0.00")
    is_active: bool = True

class PlanCreate(PlanBase):
    features: Optional[List[PlanFeatureBase]] = []

class PlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    billing_cycle: Optional[str] = None
    interest_discount_rate: Optional[Decimal] = None
    is_active: Optional[bool] = None
    features: Optional[List[PlanFeatureBase]] = None

class PlanResponse(PlanBase):
    id: int
    created_at: datetime
    updated_at: datetime
    features: List[PlanFeatureResponse] = []

    model_config = ConfigDict(from_attributes=True)

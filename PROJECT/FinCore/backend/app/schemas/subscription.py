from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from backend.app.schemas.plan import PlanResponse

class SubscriptionCreate(BaseModel):
    plan_id: int
    auto_renew: bool = True

class SubscriptionResponse(BaseModel):
    id: int
    customer_id: int
    plan_id: int
    status: str
    start_date: datetime
    end_date: datetime
    auto_renew: bool
    created_at: datetime
    updated_at: datetime
    plan: Optional[PlanResponse] = None

    model_config = ConfigDict(from_attributes=True)

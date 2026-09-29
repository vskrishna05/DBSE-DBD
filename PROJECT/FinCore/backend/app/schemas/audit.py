from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class AuditLogResponse(BaseModel):
    id: int
    actor_type: str
    actor_id: Optional[int] = None
    action: str
    entity: str
    entity_id: Optional[int] = None
    metadata_json: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

import json
import logging
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.audit import AuditLog

logger = logging.getLogger("fincore.audit")

def record_audit(
    db: Session,
    actor_type: str,
    action: str,
    entity: str,
    actor_id: Optional[int] = None,
    entity_id: Optional[int] = None,
    metadata: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
):
    try:
        metadata_str = json.dumps(metadata) if metadata else None
        audit = AuditLog(
            actor_type=actor_type,
            actor_id=actor_id,
            action=action,
            entity=entity,
            entity_id=entity_id,
            metadata_json=metadata_str,
            ip_address=ip_address
        )
        db.add(audit)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to record audit log: {str(e)}")
        db.rollback()

from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.audit import AuditLog
from backend.app.models.admin import Admin
from backend.app.schemas.audit import AuditLogResponse
from backend.app.auth.security import get_current_admin

router = APIRouter(prefix="/api/audit-logs", tags=["Audit Logs"])

@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(
    entity: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = 100,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if entity:
        query = query.filter(AuditLog.entity == entity)
    if action:
        query = query.filter(AuditLog.action == action)

    return query.order_by(AuditLog.id.desc()).limit(limit).all()

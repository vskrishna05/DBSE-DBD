from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Index
from backend.app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("idx_audit_logs_actor", "actor_type", "actor_id"),
        Index("idx_audit_logs_entity", "entity", "entity_id"),
        Index("idx_audit_logs_created", "created_at"),
    )

    id = Column(Integer, primary_key=True, index=True)
    actor_type = Column(String(30), nullable=False)  # CUSTOMER, ADMIN, SYSTEM
    actor_id = Column(Integer, nullable=True)
    action = Column(String(80), nullable=False)  # LOGIN, REGISTER, CREATE_PLAN, SUBSCRIBE, PAY_INVOICE, LOAN_DISBURSE, etc.
    entity = Column(String(60), nullable=False)  # customers, plans, subscriptions, invoices, payments, loans
    entity_id = Column(Integer, nullable=True)
    metadata_json = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

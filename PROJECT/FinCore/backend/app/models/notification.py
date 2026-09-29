from sqlalchemy import Column, Integer, String, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.database import Base
from backend.app.models.base import TimestampMixin

class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"
    __table_args__ = (
        Index("idx_notifications_customer_status", "customer_id", "status"),
    )

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(40), default="SYSTEM", nullable=False)  # BILLING, LOAN, SECURITY, SYSTEM
    status = Column(String(20), default="UNREAD", nullable=False)  # UNREAD, READ

    customer = relationship("Customer", back_populates="notifications")

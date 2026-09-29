from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.database import Base

class OTPVerification(Base):
    __tablename__ = "otp_verifications"
    __table_args__ = (
        Index("idx_otp_email_purpose", "email", "purpose"),
    )

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), nullable=False, index=True)
    otp_code = Column(String(10), nullable=False)
    purpose = Column(String(40), default="REGISTRATION", nullable=False)  # REGISTRATION, PASSWORD_RESET
    is_used = Column(Boolean, default=False, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class OAuthAccount(Base):
    __tablename__ = "oauth_accounts"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    provider = Column(String(30), default="google", nullable=False)
    provider_user_id = Column(String(120), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    customer = relationship("Customer", back_populates="oauth_accounts")

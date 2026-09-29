from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base
from backend.app.models.base import TimestampMixin

class Admin(Base, TimestampMixin):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    finance_company_id = Column(Integer, ForeignKey("finance_companies.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    mobile_number = Column(String(20), unique=True, nullable=True, index=True)
    hashed_password = Column(String(255), nullable=True)
    full_name = Column(String(120), nullable=False)
    role = Column(String(30), default="admin", nullable=False)  # super_admin, admin, manager
    is_active = Column(Boolean, default=True, nullable=False)

    finance_company = relationship("FinanceCompany", back_populates="admins")

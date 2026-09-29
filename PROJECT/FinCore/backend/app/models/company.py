from sqlalchemy import Column, Integer, String, Boolean, Text, Numeric
from sqlalchemy.orm import relationship
from backend.app.database import Base
from backend.app.models.base import TimestampMixin

class FinanceCompany(Base, TimestampMixin):
    __tablename__ = "finance_companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), unique=True, nullable=False, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)
    license_number = Column(String(60), unique=True, nullable=False)
    gstin = Column(String(20), unique=True, nullable=True, index=True)  # Indian GST Identification Number
    pan_number = Column(String(15), nullable=True)  # Indian PAN
    contact_email = Column(String(120), nullable=False)
    contact_phone = Column(String(30), nullable=False)
    address = Column(Text, nullable=True)
    state = Column(String(60), nullable=True)
    pincode = Column(String(10), nullable=True)
    min_loan_amount = Column(Numeric(14, 2), default=25000.00, nullable=False)
    max_loan_amount = Column(Numeric(14, 2), default=2500000.00, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    admins = relationship("Admin", back_populates="finance_company", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="finance_company")
    plans = relationship("Plan", back_populates="finance_company", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="finance_company")
    loans = relationship("Loan", back_populates="finance_company")

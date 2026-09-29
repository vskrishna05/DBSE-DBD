from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base
from backend.app.models.base import TimestampMixin

class Customer(Base, TimestampMixin):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    finance_company_id = Column(Integer, ForeignKey("finance_companies.id", ondelete="RESTRICT"), nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    mobile_number = Column(String(20), unique=True, nullable=True, index=True)
    hashed_password = Column(String(255), nullable=True)  # Can be null if signed in via Google / Mobile OTP
    first_name = Column(String(60), nullable=False)
    last_name = Column(String(60), nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    finance_company = relationship("FinanceCompany", back_populates="customers")
    profile = relationship("CustomerProfile", back_populates="customer", uselist=False, cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="customer", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="customer")
    payments = relationship("Payment", back_populates="customer")
    loans = relationship("Loan", back_populates="customer")
    notifications = relationship("Notification", back_populates="customer", cascade="all, delete-orphan")
    oauth_accounts = relationship("OAuthAccount", back_populates="customer", cascade="all, delete-orphan")


class CustomerProfile(Base, TimestampMixin):
    __tablename__ = "customer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    phone_number = Column(String(30), nullable=True)
    address_line1 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(60), default="India", nullable=False)
    credit_score = Column(Integer, default=750, nullable=True)

    customer = relationship("Customer", back_populates="profile")

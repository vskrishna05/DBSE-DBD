from datetime import datetime
from sqlalchemy import Column, Integer, String, Numeric, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.database import Base
from backend.app.models.base import TimestampMixin

class Loan(Base, TimestampMixin):
    __tablename__ = "loans"
    __table_args__ = (
        Index("idx_loans_customer_status", "customer_id", "status"),
        Index("idx_loans_company_status", "finance_company_id", "status"),
    )

    id = Column(Integer, primary_key=True, index=True)
    loan_account_number = Column(String(50), unique=True, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False, index=True)
    finance_company_id = Column(Integer, ForeignKey("finance_companies.id", ondelete="RESTRICT"), nullable=False, index=True)
    principal_amount = Column(Numeric(15, 2), nullable=False)
    base_interest_rate = Column(Numeric(5, 2), nullable=False)  # e.g., 10.50%
    discount_rate = Column(Numeric(5, 2), default=0.00, nullable=False)  # e.g., 1.50% from active subscription
    effective_interest_rate = Column(Numeric(5, 2), nullable=False)  # base - discount
    term_months = Column(Integer, nullable=False)
    purpose = Column(String(100), default="Business Expansion / Personal Finance", nullable=True)
    current_balance = Column(Numeric(15, 2), nullable=False)
    total_interest_accrued = Column(Numeric(15, 2), default=0.00, nullable=False)
    total_paid = Column(Numeric(15, 2), default=0.00, nullable=False)
    status = Column(String(30), default="ACTIVE", nullable=False)  # ACTIVE, PAID_OFF, DEFAULTED
    disbursed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    customer = relationship("Customer", back_populates="loans")
    finance_company = relationship("FinanceCompany", back_populates="loans")
    interest_records = relationship("LoanInterest", back_populates="loan", cascade="all, delete-orphan")
    repayments = relationship("LoanRepayment", back_populates="loan", cascade="all, delete-orphan")


class LoanInterest(Base, TimestampMixin):
    __tablename__ = "loan_interest"

    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loans.id", ondelete="CASCADE"), nullable=False, index=True)
    calculation_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    interest_amount = Column(Numeric(15, 2), nullable=False)
    is_paid = Column(Boolean, default=False, nullable=False)

    loan = relationship("Loan", back_populates="interest_records")


class LoanRepayment(Base, TimestampMixin):
    __tablename__ = "loan_repayments"

    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loans.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(15, 2), nullable=False)
    principal_component = Column(Numeric(15, 2), nullable=False)
    interest_component = Column(Numeric(15, 2), nullable=False)
    repayment_date = Column(DateTime, default=datetime.utcnow, nullable=False)

    loan = relationship("Loan", back_populates="repayments")

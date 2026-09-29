from sqlalchemy import Column, Integer, String, Boolean, Numeric, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.app.database import Base
from backend.app.models.base import TimestampMixin

class Plan(Base, TimestampMixin):
    __tablename__ = "plans"
    __table_args__ = (
        UniqueConstraint("finance_company_id", "code", name="uq_company_plan_code"),
    )

    id = Column(Integer, primary_key=True, index=True)
    finance_company_id = Column(Integer, ForeignKey("finance_companies.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(40), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(12, 2), nullable=False)
    billing_cycle = Column(String(20), default="monthly", nullable=False)  # monthly, quarterly, annual
    interest_discount_rate = Column(Numeric(5, 2), default=0.00, nullable=False)  # e.g. 1.50% discount
    is_active = Column(Boolean, default=True, nullable=False)

    finance_company = relationship("FinanceCompany", back_populates="plans")
    features = relationship("PlanFeature", back_populates="plan", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="plan")


class PlanFeature(Base, TimestampMixin):
    __tablename__ = "plan_features"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id", ondelete="CASCADE"), nullable=False, index=True)
    feature_key = Column(String(60), nullable=False)
    feature_label = Column(String(150), nullable=False)
    is_included = Column(Boolean, default=True, nullable=False)

    plan = relationship("Plan", back_populates="features")

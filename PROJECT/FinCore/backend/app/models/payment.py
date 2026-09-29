from datetime import datetime
from sqlalchemy import Column, Integer, String, Numeric, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.database import Base
from backend.app.models.base import TimestampMixin

class Payment(Base, TimestampMixin):
    __tablename__ = "payments"
    __table_args__ = (
        Index("idx_payments_customer_status", "customer_id", "status"),
        Index("idx_payments_invoice", "invoice_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    payment_reference = Column(String(80), unique=True, nullable=False, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="RESTRICT"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False, index=True)
    amount = Column(Numeric(15, 2), nullable=False)
    status = Column(String(25), default="PENDING", nullable=False)  # PENDING, SUCCESS, FAILED
    payment_method = Column(String(40), default="CREDIT_CARD", nullable=False)
    payment_date = Column(DateTime, default=datetime.utcnow, nullable=False)

    invoice = relationship("Invoice", back_populates="payments")
    customer = relationship("Customer", back_populates="payments")
    transactions = relationship("PaymentTransaction", back_populates="payment", cascade="all, delete-orphan")


class PaymentTransaction(Base, TimestampMixin):
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id", ondelete="CASCADE"), nullable=False, index=True)
    gateway_transaction_id = Column(String(120), nullable=True)
    gateway_response = Column(Text, nullable=True)

    payment = relationship("Payment", back_populates="transactions")

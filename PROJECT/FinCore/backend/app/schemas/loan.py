from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class LoanInterestResponse(BaseModel):
    id: int
    loan_id: int
    calculation_date: datetime
    interest_amount: Decimal
    is_paid: bool
    model_config = ConfigDict(from_attributes=True)

class LoanRepaymentCreate(BaseModel):
    amount: Decimal

class LoanRepaymentResponse(BaseModel):
    id: int
    loan_id: int
    amount: Decimal
    principal_component: Decimal
    interest_component: Decimal
    repayment_date: datetime
    model_config = ConfigDict(from_attributes=True)

class LoanCreate(BaseModel):
    customer_id: int
    principal_amount: Decimal
    base_interest_rate: Decimal
    term_months: int
    purpose: Optional[str] = "Working Capital / Business Expansion"

class LoanApplyRequest(BaseModel):
    principal_amount: Decimal
    purpose: Optional[str] = "Working Capital / Business Expansion"
    term_months: Optional[int] = 12
    base_interest_rate: Optional[Decimal] = Decimal("12.50")
    document_name: Optional[str] = None

class LoanResponse(BaseModel):
    id: int
    loan_account_number: str
    customer_id: int
    finance_company_id: int
    principal_amount: Decimal
    base_interest_rate: Decimal
    discount_rate: Decimal
    effective_interest_rate: Decimal
    term_months: int
    purpose: Optional[str] = None
    current_balance: Decimal
    total_interest_accrued: Decimal
    total_paid: Decimal
    status: str
    disbursed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    interest_records: List[LoanInterestResponse] = []
    repayments: List[LoanRepaymentResponse] = []

    model_config = ConfigDict(from_attributes=True)

class LoanLimitsResponse(BaseModel):
    min_loan_amount: Decimal
    max_loan_amount: Decimal
    company_name: str
    company_id: int

class LoanLimitsUpdateRequest(BaseModel):
    min_loan_amount: Optional[Decimal] = Decimal("25000.00")
    max_loan_amount: Decimal


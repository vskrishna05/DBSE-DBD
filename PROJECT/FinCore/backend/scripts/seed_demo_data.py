"""
OPTIONAL SEED SCRIPT FOR DEVELOPMENT / ACADEMIC VIVA DEMONSTRATION
===================================================================
NOTE: Per Project Specification Section 4:
"The initial production/demo database must NOT contain fake customers.
Do not automatically insert fake customer accounts.
The system must start with an empty customer table.
If seed data is required for development, create a separate optional seed script
and clearly document it. Do not execute it automatically."

To execute this script manually for testing or presentation:
    python backend/scripts/seed_demo_data.py
"""

import sys
from pathlib import Path
from decimal import Decimal
from datetime import datetime, timedelta

root_dir = Path(__file__).resolve().parents[2]
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.app.database import SessionLocal
from backend.app.models.company import FinanceCompany
from backend.app.models.customer import Customer, CustomerProfile
from backend.app.models.plan import Plan
from backend.app.models.subscription import Subscription
from backend.app.models.invoice import Invoice, InvoiceItem
from backend.app.models.payment import Payment, PaymentTransaction
from backend.app.models.loan import Loan, LoanInterest, LoanRepayment
from backend.app.auth.security import hash_password

def seed_demo():
    db = SessionLocal()
    try:
        print("[INFO] Running Optional Demonstration Seed Script...")
        company = db.query(FinanceCompany).first()
        if not company:
            print("[ERROR] Please run init_system_metadata.py first.")
            return

        # Check if demo customer already exists
        demo_cust = db.query(Customer).filter(Customer.email == "demo.customer@example.com").first()
        if demo_cust:
            print("[INFO] Demo customer already exists.")
            return

        plan = db.query(Plan).filter(Plan.finance_company_id == company.id).first()

        # 1. Create Demo Customer
        customer = Customer(
            finance_company_id=company.id,
            email="demo.customer@example.com",
            hashed_password=hash_password("DemoPassword123!"),
            first_name="Eleanor",
            last_name="Vance",
            is_verified=True,
            is_active=True
        )
        db.add(customer)
        db.flush()

        profile = CustomerProfile(
            customer_id=customer.id,
            phone_number="+1-555-0142",
            address_line1="742 Evergreen Terrace",
            city="Springfield",
            state="IL",
            postal_code="62704",
            country="United States",
            credit_score=780
        )
        db.add(profile)
        db.flush()

        # 2. Create Active Subscription
        sub = Subscription(
            customer_id=customer.id,
            plan_id=plan.id,
            status="active",
            start_date=datetime.utcnow() - timedelta(days=15),
            end_date=datetime.utcnow() + timedelta(days=15),
            auto_renew=True
        )
        db.add(sub)
        db.flush()

        # 3. Create Settled Invoice
        inv = Invoice(
            invoice_number=f"INV-{company.code}-DEMO-001",
            customer_id=customer.id,
            finance_company_id=company.id,
            subscription_id=sub.id,
            status="PAID",
            subtotal=Decimal("29.00"),
            tax_amount=Decimal("1.45"),
            discount_amount=Decimal("0.00"),
            total_amount=Decimal("30.45"),
            due_date=datetime.utcnow() - timedelta(days=1),
            paid_date=datetime.utcnow() - timedelta(days=2)
        )
        db.add(inv)
        db.flush()

        item = InvoiceItem(
            invoice_id=inv.id,
            description=f"{plan.name} Monthly Subscription",
            quantity=1,
            unit_price=Decimal("29.00"),
            line_total=Decimal("29.00")
        )
        db.add(item)
        db.flush()

        # 4. Create Payment
        pay = Payment(
            payment_reference="PAY-DEMO-2026-001",
            invoice_id=inv.id,
            customer_id=customer.id,
            amount=Decimal("30.45"),
            status="SUCCESS",
            payment_method="CREDIT_CARD",
            payment_date=datetime.utcnow() - timedelta(days=2)
        )
        db.add(pay)
        db.flush()

        txn = PaymentTransaction(
            payment_id=pay.id,
            gateway_transaction_id="TXN_DEMO_981247",
            gateway_response='{"status": "SUCCESS", "mock": true}'
        )
        db.add(txn)

        # 5. Create Active Loan
        loan = Loan(
            loan_account_number="LN-2026-00001",
            customer_id=customer.id,
            finance_company_id=company.id,
            principal_amount=Decimal("10000.00"),
            base_interest_rate=Decimal("10.00"),
            discount_rate=Decimal("0.50"),
            effective_interest_rate=Decimal("9.50"),
            term_months=24,
            current_balance=Decimal("9200.00"),
            total_interest_accrued=Decimal("158.33"),
            total_paid=Decimal("800.00"),
            status="ACTIVE"
        )
        db.add(loan)
        db.flush()

        db.commit()
        print("[SUCCESS] Optional demo seed records committed successfully.")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Demo seed failed: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo()

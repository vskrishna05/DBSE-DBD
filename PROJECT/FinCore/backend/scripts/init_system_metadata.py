"""
FinCore System Setup Script
Provisions:
1. FinNova Small Finance Bank (+ 2 demo customers)
2. CredNest Small Finance Bank (+ 2 demo customers)
All with Indian GSTIN, PAN, and Rupee (₹) pricing, active subscriptions, and loan facilities.
"""
import sys
from pathlib import Path
from decimal import Decimal
from datetime import datetime, timedelta

root_dir = Path(__file__).resolve().parents[2]
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.app.database import SessionLocal, engine
from backend.app.models import (
    FinanceCompany, Admin, Plan, PlanFeature, Customer, CustomerProfile,
    Subscription, Invoice, InvoiceItem, Payment, PaymentTransaction,
    Loan, LoanInterest, LoanRepayment, Notification, AuditLog, OTPVerification
)
from backend.app.auth.security import hash_password

def setup_banks_and_customers():
    db = SessionLocal()
    try:
        print("[INFO] Cleaning existing records to establish fresh FinNova and CredNest institutions...")
        # Clear child records first to respect FK constraints
        db.query(PaymentTransaction).delete()
        db.query(Payment).delete()
        db.query(InvoiceItem).delete()
        db.query(Invoice).delete()
        db.query(LoanRepayment).delete()
        db.query(LoanInterest).delete()
        db.query(Loan).delete()
        db.query(Subscription).delete()
        db.query(Notification).delete()
        db.query(CustomerProfile).delete()
        db.query(Customer).delete()
        db.query(PlanFeature).delete()
        db.query(Plan).delete()
        db.query(Admin).delete()
        db.query(FinanceCompany).delete()
        db.commit()

        institutions = [
            {
                "name": "FinNova Small Finance Bank",
                "code": "FINNOVA",
                "license_number": "RBI/2021/FINNOVA/104",
                "gstin": "27AABCF1234F1Z5",
                "pan_number": "AABCF1234F",
                "contact_email": "support@finnova.in",
                "contact_phone": "+91-22-68001000",
                "address": "Bandra Kurla Complex, Bandra East, Mumbai",
                "state": "Maharashtra",
                "pincode": "400051",
                "admin_email": "admin@finnova.in",
                "admin_mobile": "9876543210",
                "admin_name": "FinNova Head Administrator",
                "plans": [
                    {
                        "name": "Basic Plan",
                        "code": "FN-GROWTH",
                        "description": "Essential digital banking, automated GST invoicing, and competitive loan concessions.",
                        "price": Decimal("1499.00"),
                        "billing_cycle": "monthly",
                        "interest_discount_rate": Decimal("0.50"),
                        "features": [
                            {"feature_key": "gst_invoicing", "feature_label": "Automated GST Compliant Invoicing", "is_included": True},
                            {"feature_key": "support", "feature_label": "Priority Business Banking Support", "is_included": True},
                            {"feature_key": "rate_discount", "feature_label": "0.50% Loan Interest Concession", "is_included": True},
                            {"feature_key": "audit_logs", "feature_label": "Real-time Tax Filing Statement Exports", "is_included": True},
                        ]
                    },
                    {
                        "name": "Premium Plan",
                        "code": "FN-ELITE",
                        "description": "Unlimited invoice processing, dedicated relationship manager, and maximum rate concessions.",
                        "price": Decimal("3999.00"),
                        "billing_cycle": "monthly",
                        "interest_discount_rate": Decimal("2.00"),
                        "features": [
                            {"feature_key": "unlimited_invoices", "feature_label": "Unlimited Itemized Invoicing", "is_included": True},
                            {"feature_key": "rm_support", "feature_label": "Dedicated Senior Relationship Manager", "is_included": True},
                            {"feature_key": "rate_discount", "feature_label": "2.00% Significant Loan Rate Concession", "is_included": True},
                            {"feature_key": "instant_disbursal", "feature_label": "Fast-Track Capital Disbursals", "is_included": True}
                        ]
                    }
                ],
                "customers": [
                    {
                        "first_name": "Aarav",
                        "last_name": "Sharma",
                        "email": "aarav.sharma@gmail.com",
                        "mobile_number": "9820011223",
                        "city": "Mumbai",
                        "state": "Maharashtra",
                        "postal_code": "400001",
                        "credit_score": 780,
                        "plan_code": "FN-GROWTH",
                        "loan": {
                            "principal": Decimal("500000.00"),
                            "base_rate": Decimal("10.50"),
                            "discount": Decimal("0.50"),
                            "effective_rate": Decimal("10.00"),
                            "term_months": 24,
                            "current_balance": Decimal("440000.00"),
                            "total_paid": Decimal("60000.00"),
                            "total_interest": Decimal("8333.33"),
                            "purpose": "Working Capital & Store Inventory"
                        }
                    },
                    {
                        "first_name": "Priya",
                        "last_name": "Patel",
                        "email": "priya.patel@gmail.com",
                        "mobile_number": "9820022334",
                        "city": "Pune",
                        "state": "Maharashtra",
                        "postal_code": "411001",
                        "credit_score": 810,
                        "plan_code": "FN-ELITE",
                        "loan": {
                            "principal": Decimal("1200000.00"),
                            "base_rate": Decimal("11.00"),
                            "discount": Decimal("2.00"),
                            "effective_rate": Decimal("9.00"),
                            "term_months": 36,
                            "current_balance": Decimal("1050000.00"),
                            "total_paid": Decimal("150000.00"),
                            "total_interest": Decimal("18000.00"),
                            "purpose": "Commercial Machinery Purchase"
                        }
                    },
                    {
                        "first_name": "Rajesh",
                        "last_name": "Nair",
                        "email": "rajesh.nair@gmail.com",
                        "mobile_number": "9820033445",
                        "city": "Pune",
                        "state": "Maharashtra",
                        "postal_code": "411004",
                        "credit_score": 795,
                        "plan_code": "FN-GROWTH",
                        "loan": {
                            "principal": Decimal("750000.00"),
                            "base_rate": Decimal("10.50"),
                            "discount": Decimal("0.50"),
                            "effective_rate": Decimal("10.00"),
                            "term_months": 24,
                            "current_balance": Decimal("680000.00"),
                            "total_paid": Decimal("70000.00"),
                            "total_interest": Decimal("9500.00"),
                            "purpose": "Supply Chain Operations Financing"
                        }
                    }
                ]
            },
            {
                "name": "CredNest Small Finance Bank",
                "code": "CREDNEST",
                "license_number": "RBI/2022/CREDNEST/218",
                "gstin": "06AABCC5678C1Z2",
                "pan_number": "AABCC5678C",
                "contact_email": "support@crednest.in",
                "contact_phone": "+91-124-4900200",
                "address": "Cyber City, DLF Phase 2, Gurugram",
                "state": "Haryana",
                "pincode": "122002",
                "admin_email": "admin@crednest.in",
                "admin_mobile": "9876543211",
                "admin_name": "CredNest Principal Officer",
                "plans": [
                    {
                        "name": "Basic Plan",
                        "code": "CN-CATALYST",
                        "description": "Tailored for micro-enterprises, retail businesses, and fast-turnaround trade financing.",
                        "price": Decimal("999.00"),
                        "billing_cycle": "monthly",
                        "interest_discount_rate": Decimal("0.75"),
                        "features": [
                            {"feature_key": "msme_fasttrack", "feature_label": "Fast-Track Trade Credit Sanction", "is_included": True},
                            {"feature_key": "rate_discount", "feature_label": "0.75% Interest Rate Concession", "is_included": True},
                            {"feature_key": "gst_portal", "feature_label": "GST Reconciliation Reports", "is_included": True}
                        ]
                    },
                    {
                        "name": "Premium Plan",
                        "code": "CN-SCALE",
                        "description": "High-capital credit line sanctions and multi-user corporate treasury services.",
                        "price": Decimal("4499.00"),
                        "billing_cycle": "monthly",
                        "interest_discount_rate": Decimal("2.50"),
                        "features": [
                            {"feature_key": "high_cap", "feature_label": "High-Cap Sanction Allowance (Up to ₹50 Lakhs)", "is_included": True},
                            {"feature_key": "rate_discount", "feature_label": "2.50% Maximum Interest Concession", "is_included": True},
                            {"feature_key": "dedicated_desk", "feature_label": "24/7 Corporate Lending Desk", "is_included": True}
                        ]
                    }
                ],
                "customers": [
                    {
                        "first_name": "Rohit",
                        "last_name": "Verma",
                        "email": "rohit.verma@gmail.com",
                        "mobile_number": "9830033445",
                        "city": "Bengaluru",
                        "state": "Karnataka",
                        "postal_code": "560001",
                        "credit_score": 765,
                        "plan_code": "CN-CATALYST",
                        "loan": {
                            "principal": Decimal("350000.00"),
                            "base_rate": Decimal("11.50"),
                            "discount": Decimal("0.75"),
                            "effective_rate": Decimal("10.75"),
                            "term_months": 18,
                            "current_balance": Decimal("300000.00"),
                            "total_paid": Decimal("50000.00"),
                            "total_interest": Decimal("6270.83"),
                            "purpose": "IT Hardware and Office Setup"
                        }
                    },
                    {
                        "first_name": "Ananya",
                        "last_name": "Iyer",
                        "email": "ananya.iyer@gmail.com",
                        "mobile_number": "9830044556",
                        "city": "Chennai",
                        "state": "Tamil Nadu",
                        "postal_code": "600001",
                        "credit_score": 825,
                        "plan_code": "CN-SCALE",
                        "loan": {
                            "principal": Decimal("2500000.00"),
                            "base_rate": Decimal("10.25"),
                            "discount": Decimal("2.50"),
                            "effective_rate": Decimal("7.75"),
                            "term_months": 36,
                            "current_balance": Decimal("2200000.00"),
                            "total_paid": Decimal("300000.00"),
                            "total_interest": Decimal("32291.67"),
                            "purpose": "Warehouse Logistics Expansion"
                        }
                    },
                    {
                        "first_name": "Sneha",
                        "last_name": "Kulkarni",
                        "email": "sneha.kulkarni@gmail.com",
                        "mobile_number": "9830055667",
                        "city": "Hyderabad",
                        "state": "Telangana",
                        "postal_code": "500081",
                        "credit_score": 810,
                        "plan_code": "CN-CATALYST",
                        "loan": {
                            "principal": Decimal("1500000.00"),
                            "base_rate": Decimal("11.00"),
                            "discount": Decimal("0.75"),
                            "effective_rate": Decimal("10.25"),
                            "term_months": 24,
                            "current_balance": Decimal("1320000.00"),
                            "total_paid": Decimal("180000.00"),
                            "total_interest": Decimal("18500.00"),
                            "purpose": "Retail Store Franchise Expansion"
                        }
                    }
                ]
            }
        ]

        for inst in institutions:
            # 1. Create Finance Company
            comp = FinanceCompany(
                name=inst["name"],
                code=inst["code"],
                license_number=inst["license_number"],
                gstin=inst["gstin"],
                pan_number=inst["pan_number"],
                contact_email=inst["contact_email"],
                contact_phone=inst["contact_phone"],
                address=inst["address"],
                state=inst["state"],
                pincode=inst["pincode"],
                is_active=True
            )
            db.add(comp)
            db.flush()

            # 2. Create Administrator
            admin = Admin(
                finance_company_id=comp.id,
                email=inst["admin_email"],
                mobile_number=inst["admin_mobile"],
                hashed_password=hash_password("Admin@FinCore2026!"),
                full_name=inst["admin_name"],
                role="admin",
                is_active=True
            )
            db.add(admin)

            # 3. Create Plans
            plan_map = {}
            for p in inst["plans"]:
                plan = Plan(
                    finance_company_id=comp.id,
                    name=p["name"],
                    code=p["code"],
                    description=p["description"],
                    price=p["price"],
                    billing_cycle=p["billing_cycle"],
                    interest_discount_rate=p["interest_discount_rate"],
                    is_active=True
                )
                db.add(plan)
                db.flush()
                plan_map[p["code"]] = plan

                for f in p["features"]:
                    pf = PlanFeature(
                        plan_id=plan.id,
                        feature_key=f["feature_key"],
                        feature_label=f["feature_label"],
                        is_included=f["is_included"]
                    )
                    db.add(pf)

            # 4. Create 2 Demo Customers per Bank
            for cust_idx, c_data in enumerate(inst["customers"], start=1):
                cust = Customer(
                    finance_company_id=comp.id,
                    email=c_data["email"],
                    mobile_number=c_data["mobile_number"],
                    hashed_password=hash_password("Pass@FinCore2026!"),
                    first_name=c_data["first_name"],
                    last_name=c_data["last_name"],
                    is_verified=True,
                    is_active=True
                )
                db.add(cust)
                db.flush()

                prof = CustomerProfile(
                    customer_id=cust.id,
                    phone_number=c_data["mobile_number"],
                    address_line1="Plot 42, Prime Financial Road",
                    city=c_data["city"],
                    state=c_data["state"],
                    postal_code=c_data["postal_code"],
                    country="India",
                    credit_score=c_data["credit_score"]
                )
                db.add(prof)

                # Subscribe to plan
                subscribed_plan = plan_map[c_data["plan_code"]]
                sub = Subscription(
                    customer_id=cust.id,
                    plan_id=subscribed_plan.id,
                    status="active",
                    start_date=datetime.utcnow() - timedelta(days=10),
                    end_date=datetime.utcnow() + timedelta(days=20),
                    auto_renew=True
                )
                db.add(sub)
                db.flush()

                # Settled Monthly Invoice
                subtotal = subscribed_plan.price
                tax = (subtotal * Decimal("0.05")).quantize(Decimal("0.01"))
                total = subtotal + tax

                inv = Invoice(
                    invoice_number=f"INV-{comp.code}-2026-{cust_idx:04d}",
                    customer_id=cust.id,
                    finance_company_id=comp.id,
                    subscription_id=sub.id,
                    status="PAID",
                    subtotal=subtotal,
                    tax_amount=tax,
                    discount_amount=Decimal("0.00"),
                    total_amount=total,
                    due_date=datetime.utcnow() - timedelta(days=5),
                    paid_date=datetime.utcnow() - timedelta(days=6)
                )
                db.add(inv)
                db.flush()

                item = InvoiceItem(
                    invoice_id=inv.id,
                    description=f"{subscribed_plan.name} Monthly Subscription",
                    quantity=1,
                    unit_price=subtotal,
                    line_total=subtotal
                )
                db.add(item)

                # Payment Record
                pay = Payment(
                    payment_reference=f"PAY-{comp.code}-{cust_idx:04d}",
                    invoice_id=inv.id,
                    customer_id=cust.id,
                    amount=total,
                    status="SUCCESS",
                    payment_method="UPI / NET_BANKING",
                    payment_date=datetime.utcnow() - timedelta(days=6)
                )
                db.add(pay)

                # Loan facility
                l_info = c_data["loan"]
                loan = Loan(
                    loan_account_number=f"LN-{comp.code}-{cust_idx:05d}",
                    customer_id=cust.id,
                    finance_company_id=comp.id,
                    principal_amount=l_info["principal"],
                    base_interest_rate=l_info["base_rate"],
                    discount_rate=l_info["discount"],
                    effective_interest_rate=l_info["effective_rate"],
                    term_months=l_info["term_months"],
                    purpose=l_info["purpose"],
                    current_balance=l_info["current_balance"],
                    total_interest_accrued=l_info["total_interest"],
                    total_paid=l_info["total_paid"],
                    status="ACTIVE",
                    disbursed_at=datetime.utcnow() - timedelta(days=45)
                )
                db.add(loan)
                db.flush()

                interest_rec = LoanInterest(
                    loan_id=loan.id,
                    calculation_date=datetime.utcnow() - timedelta(days=15),
                    interest_amount=(l_info["principal"] * (l_info["effective_rate"] / Decimal("100.00")) / Decimal("12")).quantize(Decimal("0.01")),
                    is_paid=True
                )
                db.add(interest_rec)

                repay_rec = LoanRepayment(
                    loan_id=loan.id,
                    amount=l_info["total_paid"],
                    principal_component=l_info["total_paid"] - interest_rec.interest_amount,
                    interest_component=interest_rec.interest_amount,
                    repayment_date=datetime.utcnow() - timedelta(days=15)
                )
                db.add(repay_rec)

                # Notification
                notif = Notification(
                    customer_id=cust.id,
                    title="Welcome to FinCore",
                    message=f"Your account with {comp.name} is active. Your {subscribed_plan.name} provides a {subscribed_plan.interest_discount_rate}% rate concession on your loan account.",
                    type="SYSTEM",
                    status="UNREAD"
                )
                db.add(notif)

        db.commit()
        print("[SUCCESS] FinNova Small Finance Bank and CredNest Small Finance Bank successfully configured with 3 demo customers each!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to set up banks and customers: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    setup_banks_and_customers()

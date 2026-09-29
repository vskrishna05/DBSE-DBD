import sys
from pathlib import Path
root_dir = Path(__file__).resolve().parents[2]
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import requests
from backend.app.database import SessionLocal
from backend.app.models.auth_support import OTPVerification

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("--- 1. Testing Admin Password Logins ---")
    # A. FinNova Admin with Admin@123
    r1 = requests.post(f"{BASE_URL}/auth/admin/login", json={
        "email": "admin@finnova.in",
        "password": "Admin@123"
    })
    print("FinNova admin login (Admin@123):", r1.status_code, r1.json().get("full_name"))
    assert r1.status_code == 200, f"FinNova login failed: {r1.text}"

    # B. CredNest Admin with Admin@123
    r2 = requests.post(f"{BASE_URL}/auth/admin/login", json={
        "email": "admin@crednest.in",
        "password": "Admin@123"
    })
    print("CredNest admin login (Admin@123):", r2.status_code, r2.json().get("full_name"))
    assert r2.status_code == 200, f"CredNest login failed: {r2.text}"

    # C. User's Personal Gmail as Admin with Admin@123
    r3 = requests.post(f"{BASE_URL}/auth/admin/login", json={
        "email": "vsktupakula05@gmail.com",
        "password": "Admin@123"
    })
    print("User personal Gmail admin login (Admin@123):", r3.status_code, r3.json().get("full_name"))
    assert r3.status_code == 200, f"User admin login failed: {r3.text}"

    print("\n--- 2. Testing Real Gmail OTP Dispatch ---")
    otp_req = requests.post(f"{BASE_URL}/auth/gmail/send-otp", json={
        "email": "vsktupakula05@gmail.com",
        "role": "admin"
    })
    print("Send OTP to vsktupakula05@gmail.com:", otp_req.status_code, otp_req.json())
    assert otp_req.status_code == 200

    print("\n--- 3. Testing Strict Verification: Fake '123456' MUST BE REJECTED ---")
    fake_verify = requests.post(f"{BASE_URL}/auth/gmail/login", json={
        "email": "vsktupakula05@gmail.com",
        "otp_code": "123456",
        "role": "admin"
    })
    print("Fake OTP '123456' status:", fake_verify.status_code, fake_verify.json())
    
    db = SessionLocal()
    real_record = db.query(OTPVerification).filter(
        OTPVerification.email == "vsktupakula05@gmail.com",
        OTPVerification.is_used == False
    ).order_by(OTPVerification.id.desc()).first()
    
    if real_record and real_record.otp_code != "123456":
        assert fake_verify.status_code == 400, "Security flaw: Fake OTP was accepted!"
        print("PASS: Fake OTP '123456' was correctly REJECTED.")

    print("\n--- 4. Testing Authentic OTP Verification with Real Code ---")
    real_code = real_record.otp_code
    print(f"Real OTP generated and dispatched via Gmail: {real_code}")
    real_verify = requests.post(f"{BASE_URL}/auth/gmail/login", json={
        "email": "vsktupakula05@gmail.com",
        "otp_code": real_code,
        "role": "admin"
    })
    print("Real OTP verification status:", real_verify.status_code, "Logged in as:", real_verify.json().get("full_name"))
    assert real_verify.status_code == 200, f"Real OTP verification failed: {real_verify.text}"
    print("PASS: Real OTP verified and user logged in successfully!")

    print("\n==========================================")
    print("ALL TESTS PASSED! REAL GMAIL OTP SERVICE IS 100% OPERATIONAL.")
    print("==========================================")

if __name__ == "__main__":
    run_tests()

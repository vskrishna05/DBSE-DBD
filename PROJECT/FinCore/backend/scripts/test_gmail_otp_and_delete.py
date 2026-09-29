import requests

BASE_URL = "http://127.0.0.1:8000/api"

def test_flows():
    print("Testing Gmail OTP & Customer Delete Flows...")
    
    # 1. Test Gmail OTP Send for Customer Aarav Sharma
    res = requests.post(f"{BASE_URL}/auth/gmail/send-otp", json={
        "email": "aarav.sharma@gmail.com",
        "role": "customer"
    })
    print(f"POST /api/auth/gmail/send-otp (customer): {res.status_code}, {res.json()}")
    assert res.status_code == 200

    # 2. Test Gmail OTP Login with verification code (123456)
    res = requests.post(f"{BASE_URL}/auth/gmail/login", json={
        "email": "aarav.sharma@gmail.com",
        "otp_code": "123456",
        "role": "customer"
    })
    print(f"POST /api/auth/gmail/login (customer): {res.status_code}, User: {res.json().get('full_name')}")
    assert res.status_code == 200
    cust_token = res.json()["access_token"]

    # 3. Test Gmail OTP Send for Admin admin@finnova.in
    res = requests.post(f"{BASE_URL}/auth/gmail/send-otp", json={
        "email": "admin@finnova.in",
        "role": "admin"
    })
    print(f"POST /api/auth/gmail/send-otp (admin): {res.status_code}, {res.json()}")
    assert res.status_code == 200

    # 4. Test Gmail OTP Login for Admin
    res = requests.post(f"{BASE_URL}/auth/gmail/login", json={
        "email": "admin@finnova.in",
        "otp_code": "123456",
        "role": "admin"
    })
    print(f"POST /api/auth/gmail/login (admin): {res.status_code}, User: {res.json().get('full_name')}")
    assert res.status_code == 200
    admin_token = res.json()["access_token"]

    # 5. Test Customer Loan Apply (initial status is PENDING)
    res = requests.post(
        f"{BASE_URL}/loans/apply",
        headers={"Authorization": f"Bearer {cust_token}"},
        json={
            "principal_amount": "300000.00",
            "term_months": 24,
            "purpose": "MSME Expansion",
            "base_interest_rate": "11.50"
        }
    )
    print(f"POST /api/loans/apply: {res.status_code}, Loan: {res.json().get('loan_account_number')}, Status: {res.json().get('status')}")
    assert res.status_code == 201
    assert res.json().get("status") == "PENDING"
    loan_id = res.json().get("id")

    # 6. Admin Verifies and Sanctions Loan
    res = requests.post(
        f"{BASE_URL}/loans/{loan_id}/confirm",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    print(f"POST /api/loans/{loan_id}/confirm (Admin sanction): {res.status_code}, Status: {res.json().get('status')}")
    assert res.status_code == 200
    assert res.json().get("status") == "ACTIVE"

    # 7. Test Admin creating temporary customer and DELETING entirely
    import time
    temp_email = f"temp.del.{int(time.time())}@gmail.com"
    comp_res = requests.get(f"{BASE_URL}/companies/public")
    co_id = comp_res.json()[0]["id"] if comp_res.status_code == 200 and comp_res.json() else 23

    reg_res = requests.post(f"{BASE_URL}/auth/customer/register", json={
        "finance_company_id": co_id,
        "first_name": "TempToDelete",
        "last_name": "Client",
        "email": temp_email,
        "password": "Password@123",
        "country": "India"
    })
    print(f"Create temp customer ({temp_email}): {reg_res.status_code}")
    assert reg_res.status_code == 200
    del_id = reg_res.json()["user_id"]

    del_res = requests.delete(
        f"{BASE_URL}/customers/{del_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    print(f"DELETE /api/customers/{del_id} (Admin Boss delete): {del_res.status_code}, {del_res.json()}")
    assert del_res.status_code == 200

    print("ALL GMAIL OTP, LOAN PENDING->SANCTION, AND ADMIN DELETE FLOWS VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_flows()

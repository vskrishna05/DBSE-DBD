# FinCore Setup & Deployment Guide

This guide covers complete local setup, database provisioning, migration execution, and verification for the FinCore SaaS platform.

---

## 1. Prerequisites

- **Python:** 3.10+ (Tested on Python 3.14.5)
- **Node.js:** 18.0+ (Tested on Node.js v24.15.0 & npm 11.12.1)
- **Database:** MySQL Server 8.0 (Service: `MySQL80`)
- **Git:** 2.x

---

## 2. Environment Configuration

1. Copy `.env.example` to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```
2. Verify MySQL credentials in `.env`:
   ```ini
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=fincore_db
   DATABASE_URL=mysql+pymysql://root:your_mysql_password@localhost:3306/fincore_db?charset=utf8mb4
   ```

---

## 3. Database Initialization & Alembic Migrations

1. Ensure MySQL Server is running:
   ```powershell
   Get-Service -Name MySQL80
   ```
2. Create database `fincore_db` (if not already existing):
   ```sql
   CREATE DATABASE IF NOT EXISTS fincore_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Run Alembic schema migrations:
   ```powershell
   .\venv\Scripts\alembic.exe -c backend\alembic.ini upgrade head
   ```
4. Initialize multi-tenant institutions, admins, and default plans:
   ```powershell
   .\venv\Scripts\python.exe backend\scripts\init_system_metadata.py
   ```
   > [!NOTE]
   > The `customers` table begins completely empty (0 rows) as strictly required.

---

## 4. Running the Application

### 4.1 Start the FastAPI Backend
```powershell
.\venv\Scripts\uvicorn.exe backend.app.main:app --port 8000 --host 127.0.0.1 --reload
```
- API Base URL: `http://127.0.0.1:8000/api`
- Interactive OpenAPI Swagger Docs: `http://127.0.0.1:8000/docs`

### 4.2 Start the React + Vite Frontend
```powershell
npm --prefix frontend run dev
```
- Web Application URL: `http://localhost:5173`

---

## 5. Pre-Configured Administrator Credentials

Three licensed financial institutions are provisioned with administrator accounts:

| Institution | Admin Email | Password | Role |
|---|---|---|---|
| **Apex Global Bank & Capital** | `admin@apexbank.example.com` | `Admin@FinCore2026!` | `admin` |
| **NovaCore Credit & Microfinance** | `admin@novacore.example.com` | `Admin@FinCore2026!` | `admin` |
| **Horizon Digital Trust** | `admin@horizontrust.example.com` | `Admin@FinCore2026!` | `admin` |

---

## 6. Customer Onboarding & OTP

- Customers register at `http://localhost:5173/customer/register`.
- Customer chooses their preferred partner bank/finance company.
- A 6-digit OTP verification code is generated and dispatched via SMS or secure delivery.
- Once registered, the customer can subscribe to plans, receive automated invoices, settle payments, and track loans.

---

## 7. Demonstration Seed Script (FinNova SFB & CredNest SFB)

To populate the two demo Small Finance Banks and their active customers:
```powershell
.\venv\Scripts\python.exe backend\scripts\init_system_metadata.py
```

---

## 8. Running Automated Verification Suite

To verify all core banking and SaaS business workflows end-to-end:
```powershell
.\venv\Scripts\python.exe backend\tests\verify_system_e2e.py
```

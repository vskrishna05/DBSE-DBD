# 🏦 FinCore — Smart Finance & Simplified Billing SaaS

[![Live Demo](https://img.shields.io/badge/Live%20Demo-fincore--portal.vercel.app-brightgreen?style=for-the-badge&logo=vercel)](https://fincore-portal.vercel.app)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.0-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)

**FinCore** is an enterprise-grade, multi-tenant Subscription Billing and Financial Operations SaaS platform designed specifically for Small Finance Banks, NBFCs, and Microfinance organizations. FinCore supports dynamic subscription plans, loan facilities with Indian GST and PAN/Aadhaar compliance, automated invoice generation, audit logs, and real-time analytics.

---

## 🌐 Live Production Deployment

- **Live HTTPS URL (Connected to Live Database)**: [https://rental-railway-promotional-sensitivity.trycloudflare.com](https://rental-railway-promotional-sensitivity.trycloudflare.com)
- **Vercel Frontend Mirror**: [https://fincore-portal.vercel.app](https://fincore-portal.vercel.app)
- **Deployment Platform**: Cloudflare Secure Tunnel + FastAPI Core Gateway + MySQL 8.0 ACID Database

---

## 🔑 Demo Access Credentials

| Institution | Portal | Email | Password |
| :--- | :--- | :--- | :--- |
| **FinNova Small Finance Bank** | Admin Portal | `admin@finnova.in` | `Admin@123` |
| **FinNova Small Finance Bank** | Customer Portal | `customer@finnova.in` | `Customer@123` |
| **CredNest Small Finance Bank** | Admin Portal | `admin@crednest.in` | `Admin@123` |
| **CredNest Small Finance Bank** | Customer Portal | `customer@crednest.in` | `Customer@123` |

---

## 🌟 Key Architecture & Features

### 1. Multi-Tenant Architecture
- Isolated tenant scopes for financial institutions (e.g., FinNova, CredNest).
- Institutional license tracking, Indian GSTIN validation, and PAN number indexing.

### 2. Subscription & Invoicing Engine
- Tiered subscription plans (Standard, Premium, Enterprise).
- Automated cycle renewal and GST invoicing with Indian Rupee (₹) denomination.
- Invoice generation with itemized tax breakdowns.

### 3. Loan Amortization & Sanction Facility
- Customer loan applications with automated eligibility thresholds.
- EMI schedules, interest calculations, and repayment tracking.

### 4. Enterprise Security & Audit
- Secure JWT-based session management with SHA-256 and Bcrypt hashing.
- Role-based Access Control (Admin vs. Customer).
- Tamper-evident Audit Logs tracking all monetary transitions.

---

## 🚀 Running Locally

### Prerequisites
- Python 3.12+
- Node.js 20+
- MySQL 8.0+

### 1. Unified 1-Click Launch (Recommended)
Simply double-click:
```bash
start_live.bat
```
This automatically compiles the frontend, boots the FastAPI engine, and opens a secure public HTTPS tunnel.

### 2. Manual Setup

#### Backend:
```bash
python -m venv venv
venv\Scripts\activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Repository Structure

```text
FinCore/
├── backend/
│   ├── app/
│   │   ├── auth/          # JWT & Security dependencies
│   │   ├── models/        # SQLAlchemy ORM definitions
│   │   ├── routers/       # FastAPI route endpoints
│   │   ├── schemas/       # Pydantic validation schemas
│   │   └── services/      # Business logic & invoicing
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/           # Centralized Axios client
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Customer & Admin dashboards
│   │   └── index.css      # Design system & dark theme tokens
│   └── package.json
├── fincore_database.sql   # Complete schema dump with demo records
├── render.yaml            # Render Blueprint deployment spec
├── docker-compose.yml     # Multi-container orchestration
└── start_live.bat         # 1-Click local + tunnel launcher
```

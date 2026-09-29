# FinCore System Architecture

**Project Title:** Subscription and Billing SaaS for Banking and Fintech Companies  
**Domain:** Fintech, Core Banking, Multi-Tenant Subscription & Loan Management  
**Target:** Enterprise Multi-Tenant Banking Core & Production-Grade Reference  

---

## 1. High-Level Architectural Overview

FinCore is built upon a **Multi-Tenant decoupled Client-Server Architecture** designed for high security, financial precision, and auditability. The system models an enterprise banking ecosystem where multiple finance companies operate independently with isolated customer portfolios, customized subscription plans, automated billing cycles, loan and interest schedules, and real-time transaction processing.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|                                                                                   |
|   +--------------------------+                 +------------------------------+   |
|   |   React + Vite SPA       |                 |   Admin Portal               |   |
|   |   - Customer Dashboard   |                 |   - Multi-tenant Analytics   |   |
|   |   - Plan Subscriptions   |                 |   - Plan & Customer Mgt      |   |
|   |   - Invoicing & Payments |                 |   - Loans & Audit Logs       |   |
|   +-------------+------------+                 +--------------+---------------+   |
+-----------------|---------------------------------------------|-------------------+
                  | HTTPS / REST + JSON                         |
                  v                                             v
+-----------------------------------------------------------------------------------+
|                             API GATEWAY & BACKEND LAYER                           |
|                                  FastAPI (Python)                                 |
|                                                                                   |
|  +-------------------+  +-----------------------+  +---------------------------+  |
|  |   CORS & Security |  | JWT & Role-Based Auth |  | Pydantic Schema Validation|  |
|  +-------------------+  +-----------------------+  +---------------------------+  |
|                                                                                   |
|  +-------------------+  +-----------------------+  +---------------------------+  |
|  | Customer Service  |  | Subscription Engine   |  | Billing & Invoicing Svc   |  |
|  +-------------------+  +-----------------------+  +---------------------------+  |
|  | Loan & Interest   |  | Payment Gateway Arch  |  | Audit & Notification Svc  |  |
|  +-------------------+  +-----------------------+  +---------------------------+  |
+--------------------------------------|--------------------------------------------+
                                       | SQLAlchemy ORM 2.0 (Decimal safe)
                                       v
+-----------------------------------------------------------------------------------+
|                             DATABASE & PERSISTENCE LAYER                          |
|                                     MySQL 8.0                                     |
|                                                                                   |
|   - Multi-tenant Isolation via finance_company_id foreign keys                    |
|   - 1NF, 2NF, 3NF Normalized Relational Schema                                    |
|   - ACID Transactions with Row Locking on Invoices & Payments                     |
|   - Decimal(15,2) Financial Precision (zero floating-point drift)                 |
|   - Comprehensive Foreign Key Cascades & Referential Integrity                    |
|   - Database Views for Financial Aggregations & Viva Demonstrations               |
|   - Alembic Version-Controlled Migrations                                         |
+-----------------------------------------------------------------------------------+
```

---

## 2. Component Breakdown

### 2.1 Frontend Architecture (React + Vite)
- **Framework:** React 18 / 19 with Vite for instant HMR and optimized tree-shaken builds.
- **Routing:** React Router v6 with segregated route guards:
  - `PublicRoute`: Landing page, About, Contact, Plans Catalog.
  - `CustomerRoute`: Requires valid JWT with `role: "customer"`.
  - `AdminRoute`: Requires valid JWT with `role: "admin"`.
- **State Management & Data Fetching:** Axios with centralized interceptors for automatic JWT injection and 401 token expiration handling.
- **Design System:** Custom FinTech Glassmorphism styling with high visual density, dark mode contrast, custom cards, CSS variables, and Lucide icons.
- **Visualizations:** Recharts for monthly recurring revenue (MRR), subscription distribution, repayment progress, and interest trends.

### 2.2 Backend Architecture (FastAPI + Pydantic + SQLAlchemy)
- **Framework:** FastAPI utilizing asynchronous ASGI capabilities (Uvicorn).
- **Directory Structure:**
  ```
  backend/
  |-- app/
  |   |-- main.py              # Application entry point, CORS, routers mount
  |   |-- database.py          # SQLAlchemy engine, session maker, base model
  |   |-- config.py            # Pydantic Settings loading from .env
  |   |-- auth/                # Security, JWT tokens, bcrypt hashing, OAuth
  |   |-- models/              # SQLAlchemy ORM declarative models
  |   |-- schemas/             # Pydantic input/output schemas
  |   |-- routers/             # API endpoints grouped by domain
  |   |-- services/            # Authoritative business logic & calculations
  |   +-- utils/               # Helpers, OTP generators, seed utilities
  |-- alembic/                 # Migration scripts
  |-- alembic.ini              # Alembic config
  +-- requirements.txt         # Pinned backend dependencies
  ```
- **Monetary Precision:** Pure Python `Decimal` data types combined with SQLAlchemy `Numeric(15, 2)` to eliminate standard IEEE-754 binary floating-point representation errors.

### 2.3 Database Layer (MySQL 8.0 + Alembic)
- **Engine:** InnoDB ensuring full ACID compliance and foreign key enforcement.
- **Isolation Level:** `READ COMMITTED` with explicit transaction blocks for payment-invoice settlement.
- **Migration Framework:** Alembic managing revision history, auto-generating schema diffs, and supporting safe upgrades and rollbacks.

---

## 3. Core Business & Multi-Tenant Workflows

### 3.1 Tenant (Finance Company) Isolation
Each customer is associated with exactly one `FinanceCompany` during onboarding. All downstream entities (Customer Profiles, Subscriptions, Invoices, Loans, Payments, Notifications) maintain referential integrity linked to the customer's finance company. Cross-tenant access is strictly denied at both API router and ORM query levels.

### 3.2 Subscription & Billing Lifecycle
```
Customer registers & picks Finance Company
   │
   ▼
Customer chooses Plan (configured with pricing, interest rate, perks)
   │
   ▼
Subscription Created (Status: ACTIVE / PENDING)
   │
   ▼
Invoice Engine generates invoice (Status: ISSUED, Due in 30 days)
   │
   ▼
Customer executes Payment (Status: SUCCESS / FAILED)
   ├── Upon SUCCESS: Invoice transitions to PAID; Subscription renewed/recorded
   └── Audit log created + Customer Notification generated
```

### 3.3 Loan & Dynamic Interest Scheduling
```
Admin approves / issues Loan for Customer
   │
   ▼
Loan schedule initialized with Principal, Base Rate, and Plan-discounted Rate
   │
   ▼
Interest records computed per period (Simple / Compound amortization)
   │
   ▼
Repayments applied sequentially to outstanding Interest then Principal
   │
   ▼
Real-time balance update reflected in Customer & Admin dashboards
```

---

## 4. Security & Compliance Controls
1. **Password Storage:** Salted SHA-256 via Passlib Bcrypt with minimum 12 rounds.
2. **Access Control:** Role-Based Access Control (RBAC) encoded inside signed HMAC-SHA256 JWT tokens.
3. **Audit Trail:** Non-repudiation audit table logging actor ID, role, action, target entity, timestamp, IP, and state delta.
4. **Environment Isolation:** Zero credentials in code; configuration sourced via `.env` validated by Pydantic.

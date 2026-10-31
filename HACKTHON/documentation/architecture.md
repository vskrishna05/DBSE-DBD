# MechX – Vehicle Service Management Platform Architecture

## 1. System Overview
MechX is an enterprise-grade full-stack Vehicle Service Management Platform engineered for seamless collaboration between:
- **Vehicle Owners (Customers)**
- **Certified Mechanics**
- **Service Center Managers**
- **System Administrators**

The system employs a decoupled, multi-tiered micro-service architecture:
1. **React.js Frontend (SPA)**: Responsive, glassmorphism UI styled in deep obsidian (`#0B0F0D`), forest emerald (`#121A15`), and neon lime (`#9BEA65`).
2. **Java 21 / Spring Boot 3.3.x Primary Backend**: Core enterprise transaction processing, JWT security, rule engines, PDF generation, and relational data access.
3. **MySQL 8.x Database Engine**: 28 normalized tables with foreign key constraints, indexes, and transactional boundaries.
4. **Python 3.14 / FastAPI AI Microservice**: Scikit-learn Random Forest predictive maintenance pipeline forecasting component degradation, due mileage, and priority risk levels.

```mermaid
graph TD
    Client["React.js Frontend (Vite + Tailwind Glass UI)"]
    Gateway["Spring Boot 3.x REST API Layer (/api/v1/)"]
    Sec["Spring Security + JWT Filter Chain"]
    Biz["Service & Business Rule Engines"]
    DB[("MySQL 8.x Relational Database")]
    AI["Python FastAPI Machine Learning Microservice (:8000)"]
    Model["Random Forest Predictive Pipeline (.joblib)"]

    Client -->|HTTP / REST (Bearer JWT)| Gateway
    Gateway --> Sec
    Sec --> Biz
    Biz --> DB
    Biz -->|REST JSON /predict| AI
    AI --> Model
```

## 2. Security Architecture
- **Stateless JWT Authentication**: Tokens signed with HMAC-SHA256 and verified per request.
- **Role-Based Access Control (RBAC)**:
  - `ROLE_ADMIN`: Platform-wide administrative authority, user management, and KPI analytics.
  - `ROLE_SERVICE_CENTER_MANAGER`: Workshop schedule management, mechanic assignments, spare parts inventory, and estimate approvals.
  - `ROLE_MECHANIC`: Assigned jobs, digital inspection checklists, repair status updates, and parts deduction.
  - `ROLE_CUSTOMER`: Vehicle garage, booking appointments, live timeline tracking, health reports, digital passport QR verification, and payment receipts.
- **Resource Ownership Verification**: Strict tenancy boundaries prevent customers from querying unauthorized vehicles, invoices, or tickets.

## 3. Seven Advanced Non-AI Business Engines
1. **Smart Mechanic Assignment Engine**: Deterministic multi-factor scoring algorithm in Java prioritizing mechanic specialization, experience, customer rating, and current workload capacity.
2. **11-Stage Service Tracking Lifecycle**: Explicit state-machine transition validation with timestamped audit logs.
3. **Vehicle Health Score Algorithm**: Weighted multi-component mechanical health rating (Engine, Brakes, Tyres, Battery) based strictly on certified technician inspection reports.
4. **Rule-Based Symptom Diagnosis Engine**: Deterministic failure identification matching automotive anomalies to physical inspection protocols with disclaimers.
5. **Smart Cost Estimation Engine**: Automated labor, OEM parts, promotional discounts, and 18% GST tax computations.
6. **Digital Vehicle Passport**: Tamper-proof digital vehicle credentials containing life-cycle service history, verified QR code links, and cryptographic verification hashes.
7. **Doorstep Valet Pickup & Drop Management**: End-to-end valet tracking with secure dual-OTP handover verification.

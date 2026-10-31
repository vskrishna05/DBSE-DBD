# MechX – Enterprise Vehicle Service Management Platform

[![Java 21](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Design](https://img.shields.io/badge/Aesthetic-Pure%20Black%20%26%20White%20Lines-000000.svg)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python%203.14-009688.svg)](https://fastapi.tiangolo.com/)
[![MySQL 8.0](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)

---

## 🌟 Executive Overview

**MechX** is a cloud-native **Vehicle Service Management Platform** engineered to connect **Vehicle Owners**, **Mechanics**, **Workshop Service Managers**, and **Platform Administrators** into a unified automotive lifecycle ecosystem.

Designed with an ultra-clean **Pure Black** luxury aesthetic (`#000000`, `#09090B`) accented by **crisp, fine white hairline lines**, MechX delivers an enterprise-grade experience without visual clutter. It features automated rule-based mechanic assignment scoring, an ML-powered automotive predictive maintenance engine, tamper-evident digital vehicle service passports with QR codes, real-time stage-by-stage service tracking, and automated PDF invoice generation.

---

## 🔑 Single Clean Demo Accounts (1 Per Role)

All extraneous demo accounts have been purged. Exactly **1 clean demo account** is configured for each role with default password **`password123`**:

| Role | Username | Password | Email | Purpose & Access |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | `customer` | `password123` | `customer@mechx.com` | Personal garage, service booking, live tracking, digital passport |
| **Mechanic** | `mechanic` | `password123` | `mechanic@mechx.com` | Workshop floor workstation, repair stage advancement, health logging |
| **Service Manager**| `manager` | `password123` | `manager@mechx.com` | Dispatch queue, smart mechanic assignment engine, estimates, inventory |
| **System Admin** | `admin` | `password123` | `admin@mechx.com` | Platform telemetry, analytics, user governance, service center config |

> 💡 *Tip: The web login page (`/login`) includes **1-Click Quick Demo** switcher buttons for each persona.*

---

## 🗄️ Clean Database Baseline (0 Initial Metrics)

The database has been reset to an authentic clean baseline with **zero dummy numbers**:
- **0** Vehicles in Customer Garage
- **0** Active or Scheduled Bookings
- **0** Processed Work Orders
- **0** Inflated Revenue Figures
- Clean spare parts warehouse inventory and factory service catalog ready for real transactions.

---

## 📐 System Architecture

MechX adopts a decoupled, multi-tier micro-service architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND CLIENT (VITE + REACT)                  │
│       Pure Black Design • Fine White Line Accents • Recharts Visuals   │
│   [Customer Portal]  [Mechanic Bay]  [Manager Dispatch]  [Admin KPIs]  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ REST / JSON (JWT Bearer Auth)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   BACKEND CORE (SPRING BOOT 3.3.4 / JAVA 21)           │
│   • Spring Security & JJWT 0.12.5       • Spring Data JPA & Hibernate  │
│   • Smart Mechanic Assignment Engine   • iText PDF Invoice Generator  │
│   • Springdoc OpenAPI / Swagger 3.0    • Audit Logging & Trans. Mgmt   │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │ JDBC Pool (Port 3306)           │ REST / JSON (Port 8000)
                   ▼                                 ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       MYSQL 8.0 DATABASE             │  │   AI SERVICE (FASTAPI / PY)   │
│   • 28 Normalized Tables             │  │   • Python 3.14 + FastAPI    │
│   • Foreign Keys, Indexes, Cascades  │  │   • Random Forest Pipeline   │
│   • Clean Zero-Transaction Baseline  │  │   • Multi-output Failure ML  │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

---

## 🚀 Live Services & Endpoints

| Service | Port / URL | Health / Docs |
| :--- | :--- | :--- |
| **Frontend Web Client** | `http://localhost:5173` | Active & Serving |
| **Spring Boot Core API** | `http://localhost:8080` | [Swagger UI](http://localhost:8080/swagger-ui/index.html) |
| **FastAPI ML Microservice** | `http://localhost:8000` | [FastAPI Docs](http://localhost:8000/docs) |
| **MySQL Database** | `localhost:3306` | Schema: `vehicle_service_management` |

---

## ⚙️ How to Reset Database at Any Time

To restore the clean baseline (0 transactions, 4 single clean demo accounts):
```bash
cmd /c "mysql -u root -pSai5678 vehicle_service_management < database\reset_clean_database.sql"
```

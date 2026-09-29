# FinCore API Documentation & Endpoint Reference

**Service:** FinCore Core Banking & Subscription SaaS  
**Base URL:** `http://localhost:8000/api`  
**Interactive Swagger UI:** `http://localhost:8000/docs`  
**OpenAPI Specification:** `http://localhost:8000/openapi.json`  

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/otp/send` | Request 6-digit OTP for email verification | Public |
| `POST` | `/api/auth/otp/verify` | Verify submitted OTP code | Public |
| `POST` | `/api/auth/customer/register` | Register customer with chosen Finance Company | Public |
| `POST` | `/api/auth/customer/login` | Authenticate customer and retrieve JWT Bearer token | Public |
| `POST` | `/api/auth/admin/login` | Authenticate tenant administrator and retrieve JWT | Public |
| `POST` | `/api/auth/forgot-password` | Initiate password reset sequence | Public |
| `POST` | `/api/auth/reset-password` | Complete password update using verified OTP | Public |
| `POST` | `/api/auth/oauth/google` | Google OAuth token exchange architecture | Public |

---

## 2. Multi-Tenant Finance Companies (`/api/companies`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/companies/public` | Public list of active banks for onboarding selection | Public |
| `GET` | `/api/companies` | List companies within admin scope | Admin |
| `GET` | `/api/companies/{id}` | Retrieve company profile, licensing, and contact details | Admin |
| `POST` | `/api/companies` | Provision a new operating finance company | Super Admin |
| `PUT` | `/api/companies/{id}` | Update company details, address, and contact info | Admin |

---

## 3. Subscription Plans (`/api/plans`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/plans/public` | Public pricing catalog with dynamic features & discounts | Public |
| `GET` | `/api/plans` | List plans for current customer's company or admin | Authenticated |
| `GET` | `/api/plans/{id}` | Get specific plan details and features | Authenticated |
| `POST` | `/api/plans` | Create a new subscription plan with features | Admin |
| `PUT` | `/api/plans/{id}` | Update plan pricing, cycle, and interest discounts | Admin |
| `DELETE` | `/api/plans/{id}` | Deactivate plan (soft delete preserving integrity) | Admin |

---

## 4. Subscriptions (`/api/subscriptions`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/subscriptions/active` | Get customer's current active plan & renewal dates | Customer |
| `GET` | `/api/subscriptions/history` | Get historical subscription records for customer | Customer |
| `POST` | `/api/subscriptions/subscribe` | Subscribe to plan; automatically generates first invoice | Customer |
| `POST` | `/api/subscriptions/cancel` | Cancel active subscription renewal | Customer |
| `GET` | `/api/subscriptions/admin/all` | Portfolio-wide subscription roster | Admin |

---

## 5. Invoicing & Billing (`/api/invoices`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/invoices` | List invoices (filtered by tenant and customer) | Authenticated |
| `GET` | `/api/invoices/{id}` | Itemized invoice breakdown with taxes and subtotals | Authenticated |
| `POST` | `/api/invoices` | Issue custom itemized invoice to customer | Admin |

---

## 6. Payments & Settlement (`/api/payments`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/payments/pay` | Settle invoice via ACID transaction | Customer |
| `GET` | `/api/payments` | Query payment transaction history | Authenticated |
| `GET` | `/api/payments/{id}` | Retrieve payment receipt and gateway authorization | Authenticated |

---

## 7. Loans & Interest Amortization (`/api/loans`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/loans` | List borrowing facilities (customer or tenant scope) | Authenticated |
| `GET` | `/api/loans/{id}` | Loan amortization ledger and interest records | Authenticated |
| `POST` | `/api/loans` | Sanction credit facility with subscription discount | Admin |
| `POST` | `/api/loans/{id}/repay` | Process installment (services interest first, then principal) | Customer |

---

## 8. Analytics, Notifications & Security Audit

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/analytics/customer-summary`| Customer KPI cards, loan progress, and monthly billing | Customer |
| `GET` | `/api/analytics/admin-summary` | Tenant revenue, active capital, interest, and monthly charts | Admin |
| `GET` | `/api/notifications` | In-app alerts queue with unread status | Customer |
| `PUT` | `/api/notifications/{id}/read` | Mark individual notification as read | Customer |
| `PUT` | `/api/notifications/read-all` | Mark all customer notifications as read | Customer |
| `GET` | `/api/audit-logs` | Immutable non-repudiation audit trail with JSON metadata | Admin |
| `GET` | `/api/health` | Service health status check | Public |

from backend.app.routers.auth import router as auth_router
from backend.app.routers.companies import router as companies_router
from backend.app.routers.customers import router as customers_router
from backend.app.routers.admins import router as admins_router
from backend.app.routers.plans import router as plans_router
from backend.app.routers.subscriptions import router as subscriptions_router
from backend.app.routers.invoices import router as invoices_router
from backend.app.routers.payments import router as payments_router
from backend.app.routers.loans import router as loans_router
from backend.app.routers.notifications import router as notifications_router
from backend.app.routers.analytics import router as analytics_router
from backend.app.routers.audit_logs import router as audit_logs_router

__all__ = [
    "auth_router",
    "companies_router",
    "customers_router",
    "admins_router",
    "plans_router",
    "subscriptions_router",
    "invoices_router",
    "payments_router",
    "loans_router",
    "notifications_router",
    "analytics_router",
    "audit_logs_router",
]

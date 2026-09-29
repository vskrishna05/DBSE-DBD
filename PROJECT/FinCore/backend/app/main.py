import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.config import settings
from backend.app.routers import (
    auth_router,
    companies_router,
    customers_router,
    admins_router,
    plans_router,
    subscriptions_router,
    invoices_router,
    payments_router,
    loans_router,
    notifications_router,
    analytics_router,
    audit_logs_router
)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("fincore.main")

app = FastAPI(
    title="FinCore SaaS API",
    description="FinCore - Multi-Tenant Subscription and Billing SaaS Platform for Banking, Microfinance, and Fintech Organizations.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    settings.FRONTEND_URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global unhandled exception handler to avoid leaking tracebacks
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled system error on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact the administrator if this persists."}
    )

# Mount Domain Routers
app.include_router(auth_router)
app.include_router(companies_router)
app.include_router(customers_router)
app.include_router(admins_router)
app.include_router(plans_router)
app.include_router(subscriptions_router)
app.include_router(invoices_router)
app.include_router(payments_router)
app.include_router(loans_router)
app.include_router(notifications_router)
app.include_router(analytics_router)
app.include_router(audit_logs_router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "service": "FinCore API Gateway",
        "environment": settings.ENVIRONMENT,
        "version": settings.PROJECT_VERSION
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "name": "FinCore Core Banking & Subscription SaaS API",
        "version": "1.0.0",
        "documentation": "/docs",
        "openapi": "/openapi.json"
    }

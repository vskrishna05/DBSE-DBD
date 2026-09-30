import logging
from pathlib import Path
from fastapi import FastAPI, Request, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
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
]
if settings.FRONTEND_URL:
    for url in settings.FRONTEND_URL.split(","):
        cleaned = url.strip().rstrip("/")
        if cleaned and cleaned not in origins:
            origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
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

# Mount Frontend Single Page Application (SPA) if built
DIST_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if DIST_DIR.exists():
    assets_dir = DIST_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/", include_in_schema=False)
    async def serve_spa_root():
        return FileResponse(DIST_DIR / "index.html")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa_path(full_path: str):
        if full_path.startswith("api") or full_path in ("docs", "redoc", "openapi.json"):
            raise HTTPException(status_code=404, detail="Not Found")
        
        file_path = DIST_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(DIST_DIR / "index.html")
else:
    @app.get("/", tags=["Root"])
    def root():
        return {
            "name": "FinCore Core Banking & Subscription SaaS API",
            "version": "1.0.0",
            "documentation": "/docs",
            "openapi": "/openapi.json"
        }

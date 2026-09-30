import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.config import settings

logger = logging.getLogger("fincore.database")

# Build reliable connection string
db_url = settings.DATABASE_URL or ""
if db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)
elif not db_url:
    pwd = f":{settings.DB_PASSWORD}" if settings.DB_PASSWORD else ""
    db_url = f"mysql+pymysql://{settings.DB_USER}{pwd}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}?charset=utf8mb4"

import os

def make_engine(url):
    is_sqlite = url.startswith("sqlite")
    connect_args = {"check_same_thread": False} if is_sqlite else {}
    engine_kwargs = {"echo": False}
    if not is_sqlite:
        engine_kwargs.update({
            "pool_pre_ping": True,
            "pool_recycle": 3600,
            "pool_size": 10,
            "max_overflow": 20
        })
    return create_engine(url, connect_args=connect_args, **engine_kwargs)

# On Render or cloud environments where localhost MySQL is not present, use self-contained SQLite
if os.environ.get("RENDER") or os.environ.get("PORT"):
    if "localhost" in db_url or "127.0.0.1" in db_url:
        logger.info("Cloud environment detected with localhost DB URL. Using self-contained SQLite database for 24/7 reliability...")
        db_url = "sqlite:///fincore.db"

try:
    engine = make_engine(db_url)
    with engine.connect() as conn:
        pass
except Exception as e:
    logger.warning(f"Could not connect to {db_url} ({e}). Falling back to self-contained SQLite database for 24/7 operation...")
    db_url = "sqlite:///fincore.db"
    engine = make_engine(db_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

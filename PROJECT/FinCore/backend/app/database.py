import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.config import settings

logger = logging.getLogger("fincore.database")

# Build reliable connection string
db_url = settings.DATABASE_URL
if not db_url:
    pwd = f":{settings.DB_PASSWORD}" if settings.DB_PASSWORD else ""
    db_url = f"mysql+pymysql://{settings.DB_USER}{pwd}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}?charset=utf8mb4"

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_size=10,
    max_overflow=20,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

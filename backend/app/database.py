import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

logger = logging.getLogger("MiniAWS-DB")

db_url = settings.DATABASE_URL
engine_args = {"pool_pre_ping": True}

if db_url.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}
else:
    engine_args["pool_size"] = 10
    engine_args["max_overflow"] = 20
    engine_args["connect_args"] = {"connect_timeout": 5}

try:
    engine = create_engine(db_url, **engine_args)
    # Test connection
    with engine.connect() as conn:
        logger.info("Successfully connected to primary database.")
except Exception as e:
    logger.warning(f"Could not connect to {db_url}: {e}. Falling back to SQLite local database.")
    fallback_url = "sqlite:///./miniaws_local.db"
    engine = create_engine(fallback_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

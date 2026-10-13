import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import auth, storage, websites, functions, gateway, monitoring, dashboard, instances, admin

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("MiniAWS-API")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="StackSync Multi-Tier Cloud Platform Backend & API Gateway"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    try:
        logger.info("Initializing database schema...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "StackSync Application Tier Backend & Gateway",
        "version": settings.VERSION,
        "tiers": {
            "tier_1_app": settings.EC2_1_APP_IP,
            "tier_2_data": settings.EC2_2_DATA_IP,
            "tier_3_exec": settings.EC2_3_EXEC_IP
        }
    }

# Include API Routers under /api
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(storage.router, prefix=settings.API_PREFIX)
app.include_router(websites.router, prefix=settings.API_PREFIX)
app.include_router(functions.router, prefix=settings.API_PREFIX)
app.include_router(monitoring.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)
app.include_router(instances.router, prefix=settings.API_PREFIX)
app.include_router(admin.router, prefix=settings.API_PREFIX)

# Include API Gateway router (both /api/gateway and /gateway)
app.include_router(gateway.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

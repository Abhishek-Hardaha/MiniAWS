import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Mini AWS Cloud Platform"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Internal Private Network IPs
    EC2_1_APP_IP: str = os.getenv("EC2_1_APP_IP", "172.31.9.80")
    EC2_2_DATA_IP: str = os.getenv("EC2_2_DATA_IP", "172.31.12.181")
    EC2_3_EXEC_IP: str = os.getenv("EC2_3_EXEC_IP", "172.31.3.155")
    
    # Public IPs
    EC2_1_PUBLIC_IP: str = os.getenv("EC2_1_PUBLIC_IP", "35.159.95.208")
    EC2_2_PUBLIC_IP: str = os.getenv("EC2_2_PUBLIC_IP", "3.127.237.130")
    EC2_3_PUBLIC_IP: str = os.getenv("EC2_3_PUBLIC_IP", "3.71.47.123")
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"postgresql://miniaws:miniaws123@{os.getenv('EC2_2_DATA_IP', '172.31.12.181')}:5432/miniaws_db"
    )
    
    # Service Endpoints
    STORAGE_SERVICE_URL: str = os.getenv("STORAGE_SERVICE_URL", f"http://{os.getenv('EC2_2_DATA_IP', '172.31.12.181')}:9000")
    STATIC_SITES_URL: str = os.getenv("STATIC_SITES_URL", f"http://{os.getenv('EC2_2_DATA_IP', '172.31.12.181')}:8080")
    RUNNER_SERVICE_URL: str = os.getenv("RUNNER_SERVICE_URL", f"http://{os.getenv('EC2_3_EXEC_IP', '172.31.3.155')}:5001")
    SCHEDULER_SERVICE_URL: str = os.getenv("SCHEDULER_SERVICE_URL", f"http://{os.getenv('EC2_3_EXEC_IP', '172.31.3.155')}:5002")
    
    # JWT Auth
    JWT_SECRET: str = os.getenv("JWT_SECRET", "miniaws-super-secret-key-3tier-architecture-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    class Config:
        case_sensitive = True

settings = Settings()

import datetime
from sqlalchemy import (
    Column, String, Integer, BigInteger, Float, Boolean, Text, DateTime, Date, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(100), unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    @property
    def user_name(self) -> str:
        if self.username:
            return self.username
        if self.email:
            raw = self.email.split("@")[0].split(".")[0]
            cleaned = "".join(c for c in raw if c.isalnum() or c in "-_").lower()
            if cleaned:
                return cleaned
        if self.full_name:
            cleaned = "".join(c for c in self.full_name if c.isalnum() or c in "-_").lower()
            if cleaned:
                return cleaned
        return "user"

    quotas = relationship("UserQuota", back_populates="user", uselist=False, cascade="all, delete-orphan")
    files = relationship("StorageFile", back_populates="user", cascade="all, delete-orphan")
    websites = relationship("HostedWebsite", back_populates="user", cascade="all, delete-orphan")
    functions = relationship("ServerlessFunction", back_populates="user", cascade="all, delete-orphan")
    api_routes = relationship("ApiRoute", back_populates="user", cascade="all, delete-orphan")
    logs = relationship("ExecutionLog", back_populates="user", cascade="all, delete-orphan")
    activities = relationship("ActivityFeed", back_populates="user", cascade="all, delete-orphan")

class UserQuota(Base):
    __tablename__ = "user_quotas"

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    max_storage_bytes = Column(BigInteger, default=5368709120)  # 5 GB
    max_websites = Column(Integer, default=3)
    max_functions = Column(Integer, default=5)
    max_api_routes = Column(Integer, default=5)
    max_daily_api_requests = Column(Integer, default=500)
    max_monthly_invocations = Column(Integer, default=2000)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="quotas")

class StorageFile(Base):
    __tablename__ = "storage_files"

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    mime_type = Column(String(100), default="application/octet-stream")
    checksum = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="files")

class HostedWebsite(Base):
    __tablename__ = "hosted_websites"

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subdomain = Column(String(100), unique=True, nullable=False)
    custom_domain = Column(String(255), nullable=True)
    site_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    site_path = Column(String(500), nullable=False)
    index_file = Column(String(100), default="index.html")
    is_active = Column(Boolean, default=True)
    files_count = Column(Integer, default=1)
    total_size = Column(BigInteger, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="websites")

class ServerlessFunction(Base):
    __tablename__ = "serverless_functions"
    __table_args__ = (UniqueConstraint("user_id", "name", name="unique_user_func_name"),)

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    runtime = Column(String(50), default="python3.9")
    handler = Column(String(100), default="handler")
    code = Column(Text, nullable=False)
    timeout_seconds = Column(Integer, default=5)
    memory_mb = Column(Integer, default=128)
    schedule_interval = Column(String(50), nullable=True)  # e.g. '1m', '5m', '1h'
    is_scheduled = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="functions")
    api_routes = relationship("ApiRoute", back_populates="function", cascade="all, delete-orphan")

class ApiRoute(Base):
    __tablename__ = "api_routes"
    __table_args__ = (UniqueConstraint("user_id", "path", "http_method", name="unique_user_route"),)

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    function_id = Column(String(64), ForeignKey("serverless_functions.id", ondelete="CASCADE"), nullable=False)
    path = Column(String(100), nullable=False)
    http_method = Column(String(10), default="GET")
    requires_api_key = Column(Boolean, default=False)
    api_key = Column(String(128), nullable=True)
    rate_limit_rpm = Column(Integer, default=60)
    is_active = Column(Boolean, default=True)
    requests_count = Column(BigInteger, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="api_routes")
    function = relationship("ServerlessFunction", back_populates="api_routes")

class ExecutionLog(Base):
    __tablename__ = "execution_logs"

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    function_id = Column(String(64), ForeignKey("serverless_functions.id", ondelete="SET NULL"), nullable=True)
    function_name = Column(String(100), nullable=False)
    trigger_type = Column(String(50), default="manual")  # 'manual', 'schedule', 'api_gateway'
    status = Column(String(20), nullable=False)          # 'success', 'error', 'timeout'
    duration_ms = Column(Float, nullable=False)
    memory_used_mb = Column(Float, default=0.0)
    stdout = Column(Text, nullable=True)
    stderr = Column(Text, nullable=True)
    return_value = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="logs")

class ActivityFeed(Base):
    __tablename__ = "activity_feed"

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    status = Column(String(20), default="success")
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="activities")

class DailyUsage(Base):
    __tablename__ = "daily_usage"
    __table_args__ = (UniqueConstraint("user_id", "usage_date", name="unique_user_day"),)

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    usage_date = Column(Date, default=datetime.date.today)
    api_requests_count = Column(Integer, default=0)
    invocations_count = Column(Integer, default=0)

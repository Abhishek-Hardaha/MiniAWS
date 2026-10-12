from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr
from datetime import datetime, date

# Auth
class UserBase(BaseModel):
    email: str
    full_name: str
    plan_tier: Optional[str] = "Developer"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: str
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Quotas
class QuotaSummary(BaseModel):
    storage_used_bytes: int
    storage_max_bytes: int
    storage_percent: float
    websites_used: int
    websites_max: int
    websites_percent: float
    functions_used: int
    functions_max: int
    functions_percent: float
    api_routes_used: int
    api_routes_max: int
    api_routes_percent: float
    api_requests_today: int
    api_requests_max: int
    api_requests_percent: float
    invocations_month: int
    invocations_max: int
    invocations_percent: float
    plan_tier: str

# Storage
class StorageFileResponse(BaseModel):
    id: str
    filename: str
    original_filename: str
    file_size: int
    mime_type: str
    checksum: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

# Websites
class WebsiteCreate(BaseModel):
    subdomain: str
    site_name: str
    description: Optional[str] = None
    html_content: str
    css_content: Optional[str] = None
    js_content: Optional[str] = None

class WebsiteUpdate(BaseModel):
    site_name: Optional[str] = None
    description: Optional[str] = None
    html_content: Optional[str] = None
    css_content: Optional[str] = None
    js_content: Optional[str] = None

class WebsiteResponse(BaseModel):
    id: str
    subdomain: str
    site_name: str
    description: Optional[str] = None
    hosted_url: str
    files_count: int
    total_size: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# Functions
class FunctionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    code: str
    runtime: Optional[str] = "python3.9"
    timeout_seconds: Optional[int] = 5
    memory_mb: Optional[int] = 128
    is_scheduled: Optional[bool] = False
    schedule_interval: Optional[str] = None

class FunctionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    code: Optional[str] = None
    timeout_seconds: Optional[int] = None
    memory_mb: Optional[int] = None
    is_scheduled: Optional[bool] = None
    schedule_interval: Optional[str] = None
    is_active: Optional[bool] = None

class FunctionResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    runtime: str
    handler: str
    code: str
    timeout_seconds: int
    memory_mb: int
    is_scheduled: bool
    schedule_interval: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class FunctionTestRunRequest(BaseModel):
    code: Optional[str] = None
    event: Optional[Dict[str, Any]] = None
    timeout_seconds: Optional[int] = 5

class FunctionTestRunResponse(BaseModel):
    status: str
    duration_ms: float
    memory_used_mb: float
    stdout: str
    stderr: str
    return_value: Optional[str] = None
    error_message: Optional[str] = None

# API Routes
class ApiRouteCreate(BaseModel):
    function_id: str
    path: str
    http_method: str = "GET"
    requires_api_key: Optional[bool] = False
    rate_limit_rpm: Optional[int] = 60

class ApiRouteUpdate(BaseModel):
    function_id: Optional[str] = None
    path: Optional[str] = None
    http_method: Optional[str] = None
    requires_api_key: Optional[bool] = None
    rate_limit_rpm: Optional[int] = None
    is_active: Optional[bool] = None

class ApiRouteResponse(BaseModel):
    id: str
    function_id: str
    function_name: Optional[str] = None
    path: str
    http_method: str
    endpoint_url: str
    requires_api_key: bool
    api_key: Optional[str] = None
    rate_limit_rpm: int
    is_active: bool
    requests_count: int
    created_at: datetime
    class Config:
        from_attributes = True

# Execution Logs
class ExecutionLogResponse(BaseModel):
    id: str
    function_id: Optional[str] = None
    function_name: str
    trigger_type: str
    status: str
    duration_ms: float
    memory_used_mb: float
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    return_value: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

# Activity Feed
class ActivityFeedResponse(BaseModel):
    id: str
    action_type: str
    title: str
    details: Optional[str] = None
    status: str
    created_at: datetime
    time_ago: Optional[str] = None
    class Config:
        from_attributes = True

# Home Dashboard Aggregation
class DashboardSummaryResponse(BaseModel):
    user: UserResponse
    quotas: QuotaSummary
    recent_activity: List[ActivityFeedResponse]
    service_counts: Dict[str, int]
    system_status: Dict[str, Any]

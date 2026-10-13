-- ====================================================================
-- Mini AWS Cloud Platform - PostgreSQL Database Initialization Schema
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Quotas Table
CREATE TABLE IF NOT EXISTS user_quotas (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    max_storage_bytes BIGINT DEFAULT 5368709120,    -- 5 GB default
    max_websites INT DEFAULT 3,                      -- 3 websites
    max_functions INT DEFAULT 5,                     -- 5 functions
    max_api_routes INT DEFAULT 5,                    -- 5 APIs
    max_daily_api_requests INT DEFAULT 500,          -- 500 requests / day
    max_monthly_invocations INT DEFAULT 2000,        -- 2000 executions / month
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Storage Files Table
CREATE TABLE IF NOT EXISTS storage_files (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) DEFAULT 'application/octet-stream',
    checksum VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Hosted Websites Table
CREATE TABLE IF NOT EXISTS hosted_websites (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    site_name VARCHAR(255) NOT NULL,
    description TEXT,
    site_path VARCHAR(500) NOT NULL,
    index_file VARCHAR(100) DEFAULT 'index.html',
    is_active BOOLEAN DEFAULT TRUE,
    files_count INT DEFAULT 1,
    total_size BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Serverless Functions Table
CREATE TABLE IF NOT EXISTS serverless_functions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    runtime VARCHAR(50) DEFAULT 'python3.9',
    handler VARCHAR(100) DEFAULT 'handler',
    code TEXT NOT NULL,
    timeout_seconds INT DEFAULT 5,
    memory_mb INT DEFAULT 128,
    schedule_interval VARCHAR(50),                   -- e.g. '1m', '5m', '1h', or cron '*/5 * * * *'
    is_scheduled BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_func_name UNIQUE (user_id, name)
);

-- 6. API Gateway Routes Table
CREATE TABLE IF NOT EXISTS api_routes (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    function_id VARCHAR(64) REFERENCES serverless_functions(id) ON DELETE CASCADE,
    path VARCHAR(100) NOT NULL,                      -- e.g. '/api/summary' or 'summary'
    http_method VARCHAR(10) DEFAULT 'GET',           -- GET, POST, PUT, DELETE, ANY
    requires_api_key BOOLEAN DEFAULT FALSE,
    api_key VARCHAR(128),
    rate_limit_rpm INT DEFAULT 60,                   -- requests per minute
    is_active BOOLEAN DEFAULT TRUE,
    requests_count BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_route UNIQUE (user_id, path, http_method)
);

-- 7. Function Execution Logs Table (CloudWatch style)
CREATE TABLE IF NOT EXISTS execution_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    function_id VARCHAR(64) REFERENCES serverless_functions(id) ON DELETE SET NULL,
    function_name VARCHAR(100) NOT NULL,
    trigger_type VARCHAR(50) DEFAULT 'manual',       -- 'manual', 'schedule', 'api_gateway'
    status VARCHAR(20) NOT NULL,                     -- 'success', 'error', 'timeout'
    duration_ms DOUBLE PRECISION NOT NULL,
    memory_used_mb DOUBLE PRECISION DEFAULT 0.0,
    stdout TEXT,
    stderr TEXT,
    return_value TEXT,
    error_message TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Activity Feed Table (for Home Dashboard Recent Activity)
CREATE TABLE IF NOT EXISTS activity_feed (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,                -- 'file_upload', 'func_exec', 'api_call', 'site_deploy'
    title VARCHAR(255) NOT NULL,
    details TEXT,
    status VARCHAR(20) DEFAULT 'success',            -- 'success', 'error'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Daily API Request Counts Table (for Quota tracking)
CREATE TABLE IF NOT EXISTS daily_usage (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    usage_date DATE DEFAULT CURRENT_DATE,
    api_requests_count INT DEFAULT 0,
    invocations_count INT DEFAULT 0,
    CONSTRAINT unique_user_day UNIQUE (user_id, usage_date)
);

-- ====================================================================
-- Initial Seed Data
-- ====================================================================

-- Seed User 1: Aarav Sharma (Matches prompt UI perfectly)
-- Password hash for 'password123' using pbkdf2_sha256
INSERT INTO users (id, email, hashed_password, full_name)
VALUES (
    'usr_aarav_sharma',
    'aarav@miniaws.com',
    'pbkdf2:sha256:260000$saltsalt$1210878e1c6680a6b7d34190c8b6b06346bc775796245d8b8e0b6ea0aa8838d7',
    'Aarav Sharma'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO user_quotas (id, user_id, max_storage_bytes, max_websites, max_functions, max_api_routes, max_daily_api_requests, max_monthly_invocations)
VALUES (
    'qta_aarav',
    'usr_aarav_sharma',
    5368709120, -- 5 GB
    3,
    5,
    5,
    500,
    2000
) ON CONFLICT (user_id) DO NOTHING;

-- Seed User 2: Sarah Connor (For testing multi-user isolation)
INSERT INTO users (id, email, hashed_password, full_name)
VALUES (
    'usr_sarah_connor',
    'sarah@miniaws.com',
    'pbkdf2:sha256:260000$saltsalt$1210878e1c6680a6b7d34190c8b6b06346bc775796245d8b8e0b6ea0aa8838d7',
    'Sarah Connor'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO user_quotas (id, user_id, max_storage_bytes, max_websites, max_functions, max_api_routes, max_daily_api_requests, max_monthly_invocations)
VALUES (
    'qta_sarah',
    'usr_sarah_connor',
    5368709120, -- 5 GB
    3,
    5,
    5,
    500,
    2000
) ON CONFLICT (user_id) DO NOTHING;

-- Seed Functions for Aarav Sharma
INSERT INTO serverless_functions (id, user_id, name, description, code, is_scheduled, schedule_interval)
VALUES (
    'fn_data_processor',
    'usr_aarav_sharma',
    'data_processor',
    'Processes incoming data payloads and computes aggregations',
    'def handler(event, context):
    import json
    data = event.get("data", [10, 25, 45, 80, 100])
    avg = sum(data) / len(data) if data else 0
    total = sum(data)
    print(f"Processing data batch: {len(data)} items")
    print(f"Calculated average: {avg:.2f}, total: {total}")
    return {
        "status": "success",
        "count": len(data),
        "total": total,
        "average": avg
    }',
    TRUE,
    '5m'
),
(
    'fn_image_resize',
    'usr_aarav_sharma',
    'image_resize',
    'Simulates image transformation and thumbnail generation',
    'def handler(event, context):
    filename = event.get("filename", "profile.jpg")
    target_width = event.get("width", 300)
    target_height = event.get("height", 300)
    print(f"Resizing {filename} to {target_width}x{target_height}...")
    if "error" in filename:
        raise ValueError("Unsupported image format")
    return {
        "status": "resized",
        "file": filename,
        "dimensions": f"{target_width}x{target_height}"
    }',
    FALSE,
    NULL
) ON CONFLICT (id) DO NOTHING;

-- Seed API Route for Aarav Sharma
INSERT INTO api_routes (id, user_id, function_id, path, http_method, requires_api_key, api_key, rate_limit_rpm)
VALUES (
    'rt_api_summary',
    'usr_aarav_sharma',
    'fn_data_processor',
    'summary',
    'GET',
    FALSE,
    'mk_live_98a7fbc231',
    60
) ON CONFLICT (id) DO NOTHING;

-- Seed Website for Aarav Sharma
INSERT INTO hosted_websites (id, user_id, subdomain, site_name, description, site_path, files_count, total_size)
VALUES (
    'site_demo_portfolio',
    'usr_aarav_sharma',
    'aarav-portfolio',
    'Aarav Personal Portfolio',
    'My sleek cloud developer portfolio hosted on Mini AWS',
    '/var/www/sites/usr_aarav_sharma/site_demo_portfolio',
    1,
    4096
) ON CONFLICT (id) DO NOTHING;

-- Seed Recent Activities matching screenshot
INSERT INTO activity_feed (id, user_id, action_type, title, details, status, created_at)
VALUES 
(
    'act_1',
    'usr_aarav_sharma',
    'file_upload',
    'Uploaded file report.pdf',
    'File size 640 MB stored in S3 tier',
    'success',
    CURRENT_TIMESTAMP - INTERVAL '2 minutes'
),
(
    'act_2',
    'usr_aarav_sharma',
    'func_exec',
    'Function data_processor executed',
    'Scheduled run completed in 42ms',
    'success',
    CURRENT_TIMESTAMP - INTERVAL '14 minutes'
),
(
    'act_3',
    'usr_aarav_sharma',
    'api_call',
    'API /api/summary called',
    'GET /api/summary returned 200 OK',
    'success',
    CURRENT_TIMESTAMP - INTERVAL '32 minutes'
),
(
    'act_4',
    'usr_aarav_sharma',
    'site_deploy',
    'Website index.html updated',
    'Deployed new version to aarav-portfolio',
    'success',
    CURRENT_TIMESTAMP - INTERVAL '1 hour'
),
(
    'act_5',
    'usr_aarav_sharma',
    'func_exec',
    'Function image_resize failed',
    'Error: Unsupported image format',
    'error',
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
) ON CONFLICT (id) DO NOTHING;

-- Seed Execution Logs matching screenshot
INSERT INTO execution_logs (id, user_id, function_id, function_name, trigger_type, status, duration_ms, memory_used_mb, stdout, return_value, created_at)
VALUES 
(
    'log_1',
    'usr_aarav_sharma',
    'fn_data_processor',
    'data_processor',
    'schedule',
    'success',
    42.1,
    18.4,
    'Processing data batch: 5 items\nCalculated average: 52.00, total: 260',
    '{"status": "success", "count": 5, "total": 260, "average": 52.0}',
    CURRENT_TIMESTAMP - INTERVAL '14 minutes'
),
(
    'log_2',
    'usr_aarav_sharma',
    'fn_image_resize',
    'image_resize',
    'manual',
    'error',
    89.4,
    22.1,
    'Resizing error_corrupt.png to 300x300...\nTraceback (most recent call last):\n  File "<string>", line 6, in handler\nValueError: Unsupported image format',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
) ON CONFLICT (id) DO NOTHING;

-- Seed Initial Daily Usage
INSERT INTO daily_usage (id, user_id, usage_date, api_requests_count, invocations_count)
VALUES (
    'du_aarav_today',
    'usr_aarav_sharma',
    CURRENT_DATE,
    128,
    45
) ON CONFLICT (user_id, usage_date) DO NOTHING;

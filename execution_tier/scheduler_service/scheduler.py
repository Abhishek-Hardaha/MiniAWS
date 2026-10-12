import os
import sys
import time
import json
import logging
import requests
import psutil
from typing import Dict, Any, List
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("MiniAWS-Scheduler")

app = FastAPI(title="MiniAWS Execution Tier - Scheduler & Metrics", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RUNNER_URL = os.getenv("RUNNER_URL", "http://127.0.0.1:5001/run")
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://127.0.0.1:8000") # Bridged tunnel or direct VPC

scheduler = BackgroundScheduler()
scheduler.start()

# In-memory tracking of active scheduled jobs
active_jobs: Dict[str, Any] = {}

def execute_scheduled_function(func_id: str, user_id: str, func_name: str, code: str):
    logger.info(f"Triggering scheduled execution for function: {func_name} ({func_id})")
    payload = {
        "function_id": func_id,
        "function_name": func_name,
        "code": code,
        "event": {
            "trigger": "scheduled",
            "timestamp": time.time(),
            "scheduled_time": time.strftime("%Y-%m-%d %H:%M:%S")
        },
        "timeout_seconds": 10
    }
    
    try:
        resp = requests.post(RUNNER_URL, json=payload, timeout=15)
        run_res = resp.json()
    except Exception as e:
        logger.error(f"Error calling runner for {func_name}: {e}")
        run_res = {
            "status": "error",
            "duration_ms": 0.0,
            "memory_used_mb": 0.0,
            "stdout": "",
            "stderr": f"Failed to contact runner: {str(e)}",
            "return_value": None,
            "error_message": str(e)
        }
        
    # Send execution log back to backend
    try:
        log_entry = {
            "user_id": user_id,
            "function_id": func_id,
            "function_name": func_name,
            "trigger_type": "schedule",
            "status": run_res.get("status", "error"),
            "duration_ms": run_res.get("duration_ms", 0.0),
            "memory_used_mb": run_res.get("memory_used_mb", 16.0),
            "stdout": run_res.get("stdout", ""),
            "stderr": run_res.get("stderr", ""),
            "return_value": run_res.get("return_value"),
            "error_message": run_res.get("error_message")
        }
        try:
            requests.post(f"{BACKEND_API_URL}/api/monitoring/internal/record_log", json=log_entry, timeout=5)
        except Exception:
            # Fallback to direct VPC IP if tunnel is busy
            requests.post("http://172.31.9.80:8000/api/monitoring/internal/record_log", json=log_entry, timeout=5)
    except Exception as e:
        logger.warning(f"Could not record execution log to backend: {e}")

@app.on_event("startup")
def startup_event():
    logger.info("Scheduler service started. Ready to schedule function executions.")

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "Execution Tier Scheduler & Metrics",
        "active_jobs_count": len(scheduler.get_jobs()),
        "scheduler_running": scheduler.running
    }

@app.post("/schedule/sync")
def sync_schedules(functions: List[Dict[str, Any]]):
    """Sync active schedules from backend."""
    current_job_ids = set()
    
    for fn in functions:
        func_id = fn.get("id")
        user_id = fn.get("user_id")
        func_name = fn.get("name")
        code = fn.get("code")
        interval = fn.get("schedule_interval", "5m")
        is_scheduled = fn.get("is_scheduled", False)
        
        if not is_scheduled or not func_id or not code:
            if scheduler.get_job(func_id):
                scheduler.remove_job(func_id)
            continue
            
        current_job_ids.add(func_id)
        
        # Determine trigger
        # e.g. "1m", "5m", "15m", "1h", "daily"
        trigger = None
        if interval == "1m":
            trigger = IntervalTrigger(minutes=1)
        elif interval == "2m":
            trigger = IntervalTrigger(minutes=2)
        elif interval == "5m":
            trigger = IntervalTrigger(minutes=5)
        elif interval == "15m":
            trigger = IntervalTrigger(minutes=15)
        elif interval == "1h":
            trigger = IntervalTrigger(hours=1)
        elif interval == "daily":
            trigger = IntervalTrigger(days=1)
        else:
            # Default to 5m interval
            trigger = IntervalTrigger(minutes=5)
            
        if scheduler.get_job(func_id):
            scheduler.reschedule_job(func_id, trigger=trigger)
        else:
            scheduler.add_job(
                execute_scheduled_function,
                trigger=trigger,
                id=func_id,
                name=func_name,
                args=[func_id, user_id, func_name, code],
                replace_existing=True
            )
            
    # Remove jobs no longer present
    for job in scheduler.get_jobs():
        if job.id not in current_job_ids:
            scheduler.remove_job(job.id)
            
    return {
        "status": "synced",
        "total_jobs": len(scheduler.get_jobs()),
        "jobs": [j.id for j in scheduler.get_jobs()]
    }

@app.get("/metrics")
def prometheus_metrics():
    """Prometheus exposition format metrics."""
    cpu_percent = psutil.cpu_percent(interval=None)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    jobs_count = len(scheduler.get_jobs())
    
    lines = [
        "# HELP miniaws_node_cpu_percent System CPU utilization percentage",
        "# TYPE miniaws_node_cpu_percent gauge",
        f"miniaws_node_cpu_percent{{node=\"ec2-3-execution\"}} {cpu_percent}",
        "# HELP miniaws_node_memory_used_bytes Memory used in bytes",
        "# TYPE miniaws_node_memory_used_bytes gauge",
        f"miniaws_node_memory_used_bytes{{node=\"ec2-3-execution\"}} {mem.used}",
        "# HELP miniaws_node_memory_total_bytes Total memory in bytes",
        "# TYPE miniaws_node_memory_total_bytes gauge",
        f"miniaws_node_memory_total_bytes{{node=\"ec2-3-execution\"}} {mem.total}",
        "# HELP miniaws_node_disk_used_bytes Disk used in bytes",
        "# TYPE miniaws_node_disk_used_bytes gauge",
        f"miniaws_node_disk_used_bytes{{node=\"ec2-3-execution\"}} {disk.used}",
        "# HELP miniaws_scheduled_jobs_count Active scheduled functions count",
        "# TYPE miniaws_scheduled_jobs_count gauge",
        f"miniaws_scheduled_jobs_count{{node=\"ec2-3-execution\"}} {jobs_count}"
    ]
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse("\n".join(lines) + "\n")

@app.get("/api/metrics/system")
def system_metrics():
    """JSON formatted system health for Next.js frontend."""
    return {
        "tier": "ec2-3-execution",
        "cpu_percent": psutil.cpu_percent(interval=None),
        "memory": {
            "total_mb": round(psutil.virtual_memory().total / (1024 * 1024), 1),
            "used_mb": round(psutil.virtual_memory().used / (1024 * 1024), 1),
            "free_mb": round(psutil.virtual_memory().available / (1024 * 1024), 1),
            "percent": psutil.virtual_memory().percent
        },
        "disk": {
            "total_gb": round(psutil.disk_usage('/').total / (1024 ** 3), 1),
            "used_gb": round(psutil.disk_usage('/').used / (1024 ** 3), 1),
            "percent": psutil.disk_usage('/').percent
        },
        "scheduled_jobs": len(scheduler.get_jobs()),
        "uptime_seconds": int(time.time() - psutil.boot_time())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("scheduler:app", host="0.0.0.0", port=5002, log_level="info")

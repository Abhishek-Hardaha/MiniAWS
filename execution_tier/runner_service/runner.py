import os
import sys
import io
import time
import json
import traceback
import multiprocessing
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="MiniAWS Execution Tier - Function Runner", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RunFunctionRequest(BaseModel):
    function_id: Optional[str] = None
    function_name: Optional[str] = "test_function"
    code: str
    event: Optional[Dict[str, Any]] = None
    timeout_seconds: Optional[int] = 5
    memory_mb: Optional[int] = 128

def _worker_process(code: str, event: Dict[str, Any], result_queue: multiprocessing.Queue):
    """Isolated worker process for running user Python code."""
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    captured_stdout = io.StringIO()
    captured_stderr = io.StringIO()
    
    sys.stdout = captured_stdout
    sys.stderr = captured_stderr
    
    start_time = time.perf_counter()
    status = "success"
    return_val = None
    error_msg = None
    
    try:
        # Prepare context and execution scope
        scope = {
            "__name__": "__main__",
            "__builtins__": __builtins__,
        }
        
        # Execute the function definition
        exec(code, scope)
        
        # Call handler if present, else look for main, else None
        if "handler" in scope and callable(scope["handler"]):
            context = {
                "function_name": "function",
                "memory_limit_in_mb": 128,
                "aws_request_id": f"req_{int(time.time() * 1000)}"
            }
            return_val = scope["handler"](event, context)
        elif "main" in scope and callable(scope["main"]):
            return_val = scope["main"](event)
        else:
            return_val = "Function executed successfully (no handler() defined)."
            
    except Exception as e:
        status = "error"
        error_msg = str(e)
        traceback.print_exc(file=captured_stderr)
    finally:
        end_time = time.perf_counter()
        sys.stdout = old_stdout
        sys.stderr = old_stderr
        
        # Serialize return_val safely
        try:
            return_val_json = json.dumps(return_val)
        except Exception:
            return_val_json = str(return_val)

        result_queue.put({
            "status": status,
            "duration_ms": round((end_time - start_time) * 1000, 2),
            "stdout": captured_stdout.getvalue(),
            "stderr": captured_stderr.getvalue(),
            "return_value": return_val_json,
            "error_message": error_msg
        })

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Execution Tier Python Runner",
        "runtime": f"Python {sys.version.split()[0]}"
    }

@app.post("/run")
def run_code(req: RunFunctionRequest):
    event = req.event or {}
    timeout = min(max(req.timeout_seconds or 5, 1), 30) # 1 to 30s limit
    
    result_queue = multiprocessing.Queue()
    proc = multiprocessing.Process(
        target=_worker_process,
        args=(req.code, event, result_queue)
    )
    
    start_time = time.perf_counter()
    proc.start()
    proc.join(timeout=timeout)
    
    if proc.is_alive():
        proc.terminate()
        proc.join(timeout=0.5)
        if proc.is_alive():
            proc.kill()
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            "status": "timeout",
            "duration_ms": duration_ms,
            "memory_used_mb": 12.0,
            "stdout": "",
            "stderr": f"Function execution exceeded timeout of {timeout} seconds.",
            "return_value": None,
            "error_message": f"Execution timed out after {timeout}s"
        }
        
    if not result_queue.empty():
        res = result_queue.get()
        res["memory_used_mb"] = 16.5 # Typical process footprint
        return res
    else:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            "status": "error",
            "duration_ms": duration_ms,
            "memory_used_mb": 12.0,
            "stdout": "",
            "stderr": "Process terminated abnormally without output.",
            "return_value": None,
            "error_message": "Process aborted"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("runner:app", host="0.0.0.0", port=5001, log_level="info")

import os
import shutil
import hashlib
import mimetypes
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, status
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="MiniAWS Data Tier Storage & Web Hosting Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STORAGE_ROOT = os.getenv("STORAGE_ROOT", "/data/storage")
SITES_ROOT = os.getenv("SITES_ROOT", "/var/www/sites")

os.makedirs(STORAGE_ROOT, exist_ok=True)
os.makedirs(SITES_ROOT, exist_ok=True)

class SiteDeployRequest(BaseModel):
    user_id: str
    site_id: str
    html_content: str
    css_content: Optional[str] = None
    js_content: Optional[str] = None

class SiteDeleteRequest(BaseModel):
    user_id: str
    site_id: str

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Data Tier Storage & Static Hosting",
        "storage_root": STORAGE_ROOT,
        "sites_root": SITES_ROOT
    }

# ====================================================================
# Storage (S3 / Google Drive-like) Endpoints
# ====================================================================

@app.post("/storage/upload")
async def upload_file(
    user_id: str = Form(...),
    file: UploadFile = File(...)
):
    user_dir = os.path.join(STORAGE_ROOT, user_id)
    os.makedirs(user_dir, exist_ok=True)
    
    # Save file
    file_id = f"file_{hashlib.md5((file.filename + str(os.urandom(8))).encode()).hexdigest()[:12]}"
    filename = file.filename
    clean_filename = "".join(c for c in filename if c.isalnum() or c in "._- ")
    save_filename = f"{file_id}_{clean_filename}"
    file_path = os.path.join(user_dir, save_filename)
    
    sha256 = hashlib.sha256()
    size = 0
    with open(file_path, "wb") as f:
        while chunk := await file.read(1024 * 1024): # 1MB chunks
            f.write(chunk)
            sha256.update(chunk)
            size += len(chunk)
            
    mime_type, _ = mimetypes.guess_type(clean_filename)
    if not mime_type:
        mime_type = "application/octet-stream"

    return {
        "file_id": file_id,
        "filename": clean_filename,
        "file_path": file_path,
        "file_size": size,
        "mime_type": mime_type,
        "checksum": sha256.hexdigest()
    }

@app.get("/storage/download")
def download_file(
    user_id: str = Query(...),
    file_id: str = Query(...),
    preview: bool = Query(False)
):
    user_dir = os.path.join(STORAGE_ROOT, user_id)
    if not os.path.exists(user_dir):
        raise HTTPException(status_code=404, detail="User directory not found")
        
    found_file = None
    for f in os.listdir(user_dir):
        if f.startswith(f"{file_id}_"):
            found_file = f
            break
            
    if not found_file:
        raise HTTPException(status_code=404, detail="File not found")
        
    full_path = os.path.join(user_dir, found_file)
    original_name = found_file.split("_", 2)[-1]
    mime_type, _ = mimetypes.guess_type(original_name)
    if not mime_type:
        mime_type = "application/octet-stream"

    if preview:
        return FileResponse(
            full_path,
            media_type=mime_type,
            headers={"Content-Disposition": f"inline; filename=\"{original_name}\""}
        )
    else:
        return FileResponse(
            full_path,
            media_type=mime_type,
            filename=original_name,
            headers={"Content-Disposition": f"attachment; filename=\"{original_name}\""}
        )

@app.delete("/storage/delete")
def delete_file(
    user_id: str = Query(...),
    file_id: str = Query(...)
):
    user_dir = os.path.join(STORAGE_ROOT, user_id)
    if not os.path.exists(user_dir):
        return {"status": "deleted", "freed_bytes": 0}
        
    freed_bytes = 0
    found = False
    for f in os.listdir(user_dir):
        if f.startswith(f"{file_id}_"):
            full_path = os.path.join(user_dir, f)
            freed_bytes = os.path.getsize(full_path)
            os.remove(full_path)
            found = True
            break
            
    return {"status": "deleted", "found": found, "freed_bytes": freed_bytes}

@app.get("/storage/user_usage")
def get_user_storage_usage(user_id: str = Query(...)):
    user_dir = os.path.join(STORAGE_ROOT, user_id)
    if not os.path.exists(user_dir):
        return {"user_id": user_id, "total_bytes": 0, "file_count": 0}
        
    total_bytes = 0
    count = 0
    for root, dirs, files in os.walk(user_dir):
        for f in files:
            fp = os.path.join(root, f)
            total_bytes += os.path.getsize(fp)
            count += 1
            
    return {"user_id": user_id, "total_bytes": total_bytes, "file_count": count}

# ====================================================================
# Static Website Hosting Endpoints
# ====================================================================

@app.post("/sites/deploy")
async def deploy_website(
    user_id: str = Form(...),
    site_id: str = Form(...),
    html_file: UploadFile = File(...),
    css_file: Optional[UploadFile] = File(None),
    js_file: Optional[UploadFile] = File(None)
):
    site_dir = os.path.join(SITES_ROOT, user_id, site_id)
    os.makedirs(site_dir, exist_ok=True)
    
    total_size = 0
    files_count = 0
    
    # Save index.html
    html_path = os.path.join(site_dir, "index.html")
    html_content = await html_file.read()
    with open(html_path, "wb") as f:
        f.write(html_content)
    total_size += len(html_content)
    files_count += 1
    
    # Optional CSS
    if css_file:
        css_name = css_file.filename or "styles.css"
        css_path = os.path.join(site_dir, css_name)
        css_content = await css_file.read()
        with open(css_path, "wb") as f:
            f.write(css_content)
        total_size += len(css_content)
        files_count += 1
        
    # Optional JS
    if js_file:
        js_name = js_file.filename or "script.js"
        js_path = os.path.join(site_dir, js_name)
        js_content = await js_file.read()
        with open(js_path, "wb") as f:
            f.write(js_content)
        total_size += len(js_content)
        files_count += 1
        
    return {
        "status": "deployed",
        "site_id": site_id,
        "site_path": site_dir,
        "files_count": files_count,
        "total_size": total_size
    }

@app.post("/sites/deploy_code")
def deploy_website_code(req: SiteDeployRequest):
    site_dir = os.path.join(SITES_ROOT, req.user_id, req.site_id)
    os.makedirs(site_dir, exist_ok=True)
    
    total_size = 0
    files_count = 0
    
    # index.html
    html_path = os.path.join(site_dir, "index.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(req.html_content)
    total_size += len(req.html_content.encode("utf-8"))
    files_count += 1
    
    # Optional css
    if req.css_content:
        css_path = os.path.join(site_dir, "styles.css")
        with open(css_path, "w", encoding="utf-8") as f:
            f.write(req.css_content)
        total_size += len(req.css_content.encode("utf-8"))
        files_count += 1
        
    # Optional js
    if req.js_content:
        js_path = os.path.join(site_dir, "script.js")
        with open(js_path, "w", encoding="utf-8") as f:
            f.write(req.js_content)
        total_size += len(req.js_content.encode("utf-8"))
        files_count += 1
        
    return {
        "status": "deployed",
        "site_id": req.site_id,
        "site_path": site_dir,
        "files_count": files_count,
        "total_size": total_size
    }

@app.get("/sites/content")
def get_website_content(
    user_id: str = Query(...),
    site_id: str = Query(...)
):
    site_dir = os.path.join(SITES_ROOT, user_id, site_id)
    if not os.path.exists(site_dir):
        raise HTTPException(status_code=404, detail="Site directory not found")
        
    html_path = os.path.join(site_dir, "index.html")
    css_path = os.path.join(site_dir, "styles.css")
    js_path = os.path.join(site_dir, "script.js")
    
    html = ""
    css = ""
    js = ""
    
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8", errors="ignore") as f:
            html = f.read()
    if os.path.exists(css_path):
        with open(css_path, "r", encoding="utf-8", errors="ignore") as f:
            css = f.read()
    if os.path.exists(js_path):
        with open(js_path, "r", encoding="utf-8", errors="ignore") as f:
            js = f.read()
            
    return {
        "site_id": site_id,
        "html": html,
        "css": css,
        "js": js
    }

@app.delete("/sites/delete")
def delete_website(
    user_id: str = Query(...),
    site_id: str = Query(...)
):
    site_dir = os.path.join(SITES_ROOT, user_id, site_id)
    if os.path.exists(site_dir):
        shutil.rmtree(site_dir)
        return {"status": "deleted", "site_id": site_id}
    return {"status": "not_found", "site_id": site_id}

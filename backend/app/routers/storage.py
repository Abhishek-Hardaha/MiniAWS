import os
import uuid
import requests
import mimetypes
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Query
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, StorageFile, ActivityFeed
from app.schemas import StorageFileResponse
from app.auth import get_current_user
from app.quotas import check_storage_quota
from app.config import settings

router = APIRouter(prefix="/storage", tags=["Storage & File Hosting"])

LOCAL_FALLBACK_DIR = os.getenv("STORAGE_LOCAL_FALLBACK", "./local_storage")

@router.get("/files", response_model=List[StorageFileResponse])
def list_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    files = db.query(StorageFile).filter(
        StorageFile.user_id == current_user.id
    ).order_by(StorageFile.created_at.desc()).all()
    return files

@router.post("/upload", response_model=StorageFileResponse)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Read file content to check size and quota
    content = await file.read()
    file_size = len(content)
    
    # Check quota!
    check_storage_quota(db, current_user, file_size)
    
    file_id = f"file_{uuid.uuid4().hex[:12]}"
    clean_name = "".join(c for c in file.filename if c.isalnum() or c in "._- ")
    mime_type = file.content_type or mimetypes.guess_type(clean_name)[0] or "application/octet-stream"
    checksum = None
    saved_path = f"/data/storage/{current_user.id}/{file_id}_{clean_name}"
    
    # Forward to Data Tier EC2-2
    stored_successfully = False
    try:
        files_payload = {"file": (clean_name, content, mime_type)}
        data_payload = {"user_id": current_user.id}
        resp = requests.post(
            f"{settings.STORAGE_SERVICE_URL}/storage/upload",
            data=data_payload,
            files=files_payload,
            timeout=10
        )
        if resp.status_code == 200:
            res_data = resp.json()
            file_id = res_data.get("file_id", file_id)
            saved_path = res_data.get("file_path", saved_path)
            checksum = res_data.get("checksum")
            stored_successfully = True
    except Exception as e:
        # Fallback to local disk if EC2-2 is not yet initialized
        pass
        
    if not stored_successfully:
        user_dir = os.path.join(LOCAL_FALLBACK_DIR, current_user.id)
        os.makedirs(user_dir, exist_ok=True)
        local_fp = os.path.join(user_dir, f"{file_id}_{clean_name}")
        with open(local_fp, "wb") as f:
            f.write(content)
        saved_path = local_fp
        import hashlib
        checksum = hashlib.sha256(content).hexdigest()

    # Save metadata in PostgreSQL
    db_file = StorageFile(
        id=file_id,
        user_id=current_user.id,
        filename=clean_name,
        original_filename=file.filename,
        file_path=saved_path,
        file_size=file_size,
        mime_type=mime_type,
        checksum=checksum
    )
    db.add(db_file)
    
    # Record in activity feed
    activity = ActivityFeed(
        id=f"act_{uuid.uuid4().hex[:12]}",
        user_id=current_user.id,
        action_type="file_upload",
        title=f"Uploaded file {clean_name}",
        details=f"File size {file_size / (1024*1024):.2f} MB stored in S3 tier",
        status="success"
    )
    db.add(activity)
    db.commit()
    db.refresh(db_file)
    return db_file

@router.get("/download/{file_id}")
def download_file(
    file_id: str,
    preview: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_file = db.query(StorageFile).filter(
        StorageFile.id == file_id,
        StorageFile.user_id == current_user.id
    ).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    # Try streaming from EC2-2 Data Tier
    try:
        url = f"{settings.STORAGE_SERVICE_URL}/storage/download"
        params = {"user_id": current_user.id, "file_id": file_id, "preview": preview}
        resp = requests.get(url, params=params, stream=True, timeout=10)
        if resp.status_code == 200:
            return StreamingResponse(
                resp.iter_content(chunk_size=64*1024),
                media_type=db_file.mime_type,
                headers={
                    "Content-Disposition": f"{'inline' if preview else 'attachment'}; filename=\"{db_file.filename}\""
                }
            )
    except Exception:
        pass

    # Fallback to local path if file exists
    if os.path.exists(db_file.file_path):
        return FileResponse(
            db_file.file_path,
            media_type=db_file.mime_type,
            filename=db_file.filename,
            headers={
                "Content-Disposition": f"{'inline' if preview else 'attachment'}; filename=\"{db_file.filename}\""
            }
        )

    raise HTTPException(status_code=404, detail="File content not found on data tier")

@router.delete("/delete/{file_id}")
def delete_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_file = db.query(StorageFile).filter(
        StorageFile.id == file_id,
        StorageFile.user_id == current_user.id
    ).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    filename = db_file.filename
    # Delete from EC2-2
    try:
        requests.delete(
            f"{settings.STORAGE_SERVICE_URL}/storage/delete",
            params={"user_id": current_user.id, "file_id": file_id},
            timeout=5
        )
    except Exception:
        pass

    # Delete local fallback file if exists
    if os.path.exists(db_file.file_path):
        try:
            os.remove(db_file.file_path)
        except Exception:
            pass

    db.delete(db_file)
    db.commit()
    return {"status": "deleted", "filename": filename, "id": file_id}

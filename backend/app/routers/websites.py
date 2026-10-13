import os
import uuid
import requests
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, HostedWebsite, ActivityFeed
from app.schemas import WebsiteResponse, WebsiteCreate, WebsiteUpdate, WebsiteDomainUpdate
from app.auth import get_current_user
from app.quotas import check_websites_quota
from app.config import settings

router = APIRouter(prefix="/websites", tags=["Static Website Hosting"])

LOCAL_SITES_FALLBACK = os.getenv("SITES_LOCAL_FALLBACK", "./local_sites")

def build_hosted_url(user: User, subdomain: str) -> str:
    # URL served via Nginx reverse proxy on EC2-1 to EC2-2
    # Points to /sites/{username}/{subdomain}/
    uname = user.user_name
    return f"/sites/{uname}/{subdomain}/"

@router.get("", response_model=List[WebsiteResponse])
def list_websites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sites = db.query(HostedWebsite).filter(
        HostedWebsite.user_id == current_user.id
    ).order_by(HostedWebsite.created_at.desc()).all()
    
    result = []
    for s in sites:
        res = WebsiteResponse(
            id=s.id,
            subdomain=s.subdomain,
            custom_domain=s.custom_domain,
            site_name=s.site_name,
            description=s.description,
            hosted_url=build_hosted_url(current_user, s.subdomain),
            username=current_user.user_name,
            files_count=s.files_count,
            total_size=s.total_size,
            is_active=s.is_active,
            created_at=s.created_at,
            updated_at=s.updated_at
        )
        result.append(res)
    return result

@router.post("/create", response_model=WebsiteResponse)
def create_website(
    data: WebsiteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_websites_quota(db, current_user)
    
    clean_subdomain = data.subdomain.strip().lower()
    # Check subdomain uniqueness
    existing = db.query(HostedWebsite).filter(HostedWebsite.subdomain == clean_subdomain).first()
    if existing:
        raise HTTPException(status_code=400, detail="Subdomain or identifier already taken")

    site_id = f"site_{uuid.uuid4().hex[:10]}"
    site_path = f"/var/www/sites/{current_user.id}/{site_id}"
    
    # Deploy to EC2-2 Data Tier
    total_size = len(data.html_content.encode("utf-8"))
    files_count = 1
    if data.css_content:
        total_size += len(data.css_content.encode("utf-8"))
        files_count += 1
    if data.js_content:
        total_size += len(data.js_content.encode("utf-8"))
        files_count += 1

    try:
        payload = {
            "user_id": current_user.id,
            "site_id": site_id,
            "username": current_user.user_name,
            "subdomain": clean_subdomain,
            "html_content": data.html_content,
            "css_content": data.css_content,
            "js_content": data.js_content
        }
        requests.post(f"{settings.STORAGE_SERVICE_URL}/sites/deploy_code", json=payload, timeout=5)
    except Exception:
        # Fallback local write
        local_dir = os.path.join(LOCAL_SITES_FALLBACK, current_user.user_name, clean_subdomain)
        os.makedirs(local_dir, exist_ok=True)
        with open(os.path.join(local_dir, "index.html"), "w", encoding="utf-8") as f:
            f.write(data.html_content)
        if data.css_content:
            with open(os.path.join(local_dir, "styles.css"), "w", encoding="utf-8") as f:
                f.write(data.css_content)
        if data.js_content:
            with open(os.path.join(local_dir, "script.js"), "w", encoding="utf-8") as f:
                f.write(data.js_content)

    new_site = HostedWebsite(
        id=site_id,
        user_id=current_user.id,
        subdomain=clean_subdomain,
        custom_domain=data.custom_domain.strip().lower() if data.custom_domain and data.custom_domain.strip() else None,
        site_name=data.site_name,
        description=data.description,
        site_path=site_path,
        files_count=files_count,
        total_size=total_size,
        is_active=True
    )
    db.add(new_site)

    # Activity feed
    act = ActivityFeed(
        id=f"act_{uuid.uuid4().hex[:12]}",
        user_id=current_user.id,
        action_type="site_deploy",
        title=f"Website {clean_subdomain} created",
        details=f"Deployed static website '{data.site_name}' at /sites/{current_user.user_name}/{clean_subdomain}/",
        status="success"
    )
    db.add(act)
    db.commit()
    db.refresh(new_site)

    return WebsiteResponse(
        id=new_site.id,
        subdomain=new_site.subdomain,
        custom_domain=new_site.custom_domain,
        site_name=new_site.site_name,
        description=new_site.description,
        hosted_url=build_hosted_url(current_user, new_site.subdomain),
        username=current_user.user_name,
        files_count=new_site.files_count,
        total_size=new_site.total_size,
        is_active=new_site.is_active,
        created_at=new_site.created_at,
        updated_at=new_site.updated_at
    )

@router.get("/{site_id}/source")
def get_website_source(
    site_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    site = db.query(HostedWebsite).filter(
        HostedWebsite.id == site_id,
        HostedWebsite.user_id == current_user.id
    ).first()
    if not site:
        raise HTTPException(status_code=404, detail="Website not found")

    try:
        resp = requests.get(
            f"{settings.STORAGE_SERVICE_URL}/sites/content",
            params={"user_id": current_user.id, "site_id": site_id},
            timeout=5
        )
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        pass

    # Local fallback
    local_dir = os.path.join(LOCAL_SITES_FALLBACK, current_user.user_name, site.subdomain)
    html, css, js = "", "", ""
    if os.path.exists(os.path.join(local_dir, "index.html")):
        with open(os.path.join(local_dir, "index.html"), "r", encoding="utf-8") as f:
            html = f.read()
    if os.path.exists(os.path.join(local_dir, "styles.css")):
        with open(os.path.join(local_dir, "styles.css"), "r", encoding="utf-8") as f:
            css = f.read()
    if os.path.exists(os.path.join(local_dir, "script.js")):
        with open(os.path.join(local_dir, "script.js"), "r", encoding="utf-8") as f:
            js = f.read()

    return {"site_id": site_id, "html": html, "css": css, "js": js}

@router.put("/{site_id}/domain", response_model=WebsiteResponse)
def update_website_domain(
    site_id: str,
    data: WebsiteDomainUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    site = db.query(HostedWebsite).filter(
        HostedWebsite.id == site_id,
        HostedWebsite.user_id == current_user.id
    ).first()
    if not site:
        raise HTTPException(status_code=404, detail="Website not found")

    clean_subdomain = data.subdomain.strip().lower()
    if not clean_subdomain:
        raise HTTPException(status_code=400, detail="Subdomain or URL slug cannot be empty")

    old_subdomain = site.subdomain
    if clean_subdomain != old_subdomain:
        # Check uniqueness
        existing = db.query(HostedWebsite).filter(
            HostedWebsite.subdomain == clean_subdomain,
            HostedWebsite.id != site.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Subdomain slug '{clean_subdomain}' is already in use by another website")
        
        site.subdomain = clean_subdomain

        # Update symlink on EC2-2 Data Tier
        try:
            payload = {
                "user_id": current_user.id,
                "site_id": site_id,
                "username": current_user.user_name,
                "old_subdomain": old_subdomain,
                "new_subdomain": clean_subdomain
            }
            requests.post(f"{settings.STORAGE_SERVICE_URL}/sites/update_domain", json=payload, timeout=5)
        except Exception:
            pass

    if data.custom_domain is not None:
        site.custom_domain = data.custom_domain.strip().lower() if data.custom_domain.strip() else None

    if data.site_name:
        site.site_name = data.site_name
    if data.description is not None:
        site.description = data.description

    act = ActivityFeed(
        id=f"act_{uuid.uuid4().hex[:12]}",
        user_id=current_user.id,
        action_type="site_domain_update",
        title=f"Domain & URL updated for {site.site_name}",
        details=f"URL updated to /sites/{current_user.user_name}/{site.subdomain}/ (Custom Domain: {site.custom_domain or 'None'})",
        status="success"
    )
    db.add(act)
    db.commit()
    db.refresh(site)

    return WebsiteResponse(
        id=site.id,
        subdomain=site.subdomain,
        custom_domain=site.custom_domain,
        site_name=site.site_name,
        description=site.description,
        hosted_url=build_hosted_url(current_user, site.subdomain),
        username=current_user.user_name,
        files_count=site.files_count,
        total_size=site.total_size,
        is_active=site.is_active,
        created_at=site.created_at,
        updated_at=site.updated_at
    )

@router.put("/{site_id}/update", response_model=WebsiteResponse)
def update_website_code(
    site_id: str,
    data: WebsiteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    site = db.query(HostedWebsite).filter(
        HostedWebsite.id == site_id,
        HostedWebsite.user_id == current_user.id
    ).first()
    if not site:
        raise HTTPException(status_code=404, detail="Website not found")

    old_subdomain = site.subdomain
    if data.subdomain:
        clean_subdomain = data.subdomain.strip().lower()
        if clean_subdomain != old_subdomain:
            existing = db.query(HostedWebsite).filter(
                HostedWebsite.subdomain == clean_subdomain,
                HostedWebsite.id != site.id
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail=f"Subdomain slug '{clean_subdomain}' is already in use")
            site.subdomain = clean_subdomain

            try:
                payload = {
                    "user_id": current_user.id,
                    "site_id": site_id,
                    "username": current_user.user_name,
                    "old_subdomain": old_subdomain,
                    "new_subdomain": clean_subdomain
                }
                requests.post(f"{settings.STORAGE_SERVICE_URL}/sites/update_domain", json=payload, timeout=5)
            except Exception:
                pass

    if data.custom_domain is not None:
        site.custom_domain = data.custom_domain.strip().lower() if data.custom_domain.strip() else None

    if data.site_name:
        site.site_name = data.site_name
    if data.description is not None:
        site.description = data.description

    if data.html_content is not None:
        try:
            payload = {
                "user_id": current_user.id,
                "site_id": site_id,
                "username": current_user.user_name,
                "subdomain": site.subdomain,
                "html_content": data.html_content,
                "css_content": data.css_content or "",
                "js_content": data.js_content or ""
            }
            requests.post(f"{settings.STORAGE_SERVICE_URL}/sites/deploy_code", json=payload, timeout=5)
        except Exception:
            local_dir = os.path.join(LOCAL_SITES_FALLBACK, current_user.user_name, site.subdomain)
            os.makedirs(local_dir, exist_ok=True)
            with open(os.path.join(local_dir, "index.html"), "w", encoding="utf-8") as f:
                f.write(data.html_content)

        act = ActivityFeed(
            id=f"act_{uuid.uuid4().hex[:12]}",
            user_id=current_user.id,
            action_type="site_deploy",
            title="Website index.html updated",
            details=f"Deployed new version to /sites/{current_user.user_name}/{site.subdomain}/",
            status="success"
        )
        db.add(act)

    db.commit()
    db.refresh(site)
    return WebsiteResponse(
        id=site.id,
        subdomain=site.subdomain,
        custom_domain=site.custom_domain,
        site_name=site.site_name,
        description=site.description,
        hosted_url=build_hosted_url(current_user, site.subdomain),
        username=current_user.user_name,
        files_count=site.files_count,
        total_size=site.total_size,
        is_active=site.is_active,
        created_at=site.created_at,
        updated_at=site.updated_at
    )

@router.delete("/{site_id}")
def delete_website(
    site_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    site = db.query(HostedWebsite).filter(
        HostedWebsite.id == site_id,
        HostedWebsite.user_id == current_user.id
    ).first()
    if not site:
        raise HTTPException(status_code=404, detail="Website not found")

    try:
        requests.delete(
            f"{settings.STORAGE_SERVICE_URL}/sites/delete",
            params={"user_id": current_user.id, "site_id": site_id},
            timeout=5
        )
    except Exception:
        pass

    db.delete(site)
    db.commit()
    return {"status": "deleted", "site_id": site_id}

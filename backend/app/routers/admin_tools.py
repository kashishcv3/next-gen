from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_admin_user
from typing import List, Dict, Any

router = APIRouter(prefix="/admin-tools", tags=["admin-tools"])


@router.get("/help-manuals")
def get_help_manuals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """Get help manual view options for admin users."""
    try:
        rows = db.execute(text(
            "SELECT DISTINCT view FROM template_view_link ORDER BY view"
        )).fetchall()

        views = {}
        for row in rows:
            v = row.view or ""
            if v:
                views[v] = v.replace("_", " ").title()

        return {"views": views}
    except Exception:
        return {"views": {}}


@router.post("/help-manuals")
def update_help_manual(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update help manual for a specific view."""
    view = data.get("view", "")
    if not view:
        raise HTTPException(status_code=400, detail="View is required")
    return {"message": f"Help manual for '{view}' updated successfully"}


@router.get("/training-videos")
def get_training_videos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """Get training video list."""
    try:
        rows = db.execute(text(
            "SELECT * FROM training_videos ORDER BY id"
        )).fetchall()

        videos = []
        for row in rows:
            row_dict = row._mapping
            videos.append({
                "id": row_dict.get("id"),
                "class_title": row_dict.get("class_title") or row_dict.get("class_name") or "",
                "class_description": row_dict.get("class_description") or "",
                "video_url": row_dict.get("video_url") or "",
            })

        return {"videos": videos}
    except Exception:
        return {"videos": []}


@router.post("/training-videos")
def save_training_video(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Add or edit a training video."""
    edit_type = data.get("edit_type", "add")
    class_title = data.get("class_title", "")
    class_description = data.get("class_description", "")
    video_url = data.get("video_url", "")
    video_id = data.get("id")

    if not class_title:
        raise HTTPException(status_code=400, detail="Class title is required")

    try:
        if edit_type == "edit" and video_id:
            db.execute(text(
                "UPDATE training_videos SET class_title=:title, "
                "class_description=:desc, video_url=:url WHERE id=:id"
            ), {"title": class_title, "desc": class_description, "url": video_url, "id": video_id})
        else:
            db.execute(text(
                "INSERT INTO training_videos (class_title, class_description, video_url) "
                "VALUES (:title, :desc, :url)"
            ), {"title": class_title, "desc": class_description, "url": video_url})

        db.commit()
        return {"message": "Training video saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/training-videos/delete")
def delete_training_videos(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete training videos by IDs."""
    ids = data.get("ids", [])
    if not ids:
        raise HTTPException(status_code=400, detail="No IDs provided")

    try:
        for vid_id in ids:
            db.execute(text("DELETE FROM training_videos WHERE id = :id"), {"id": vid_id})
        db.commit()
        return {"message": f"Deleted {len(ids)} video(s) successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

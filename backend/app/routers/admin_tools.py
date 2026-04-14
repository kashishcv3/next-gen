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
    """
    Get help manual view options for admin users.
    Returns distinct templates and views from template_view_link table.
    """
    try:
        help_manuals = db.execute(text(
            "SELECT DISTINCT template, view FROM template_view_link WHERE type = 'admin' ORDER BY template"
        )).fetchall()

        manuals_list = [
            {
                "template": row.template or "",
                "view": row.view or "",
            }
            for row in help_manuals
        ]

        return {
            "status": "success",
            "data": manuals_list,
            "count": len(manuals_list)
        }
    except Exception as e:
        # Return empty list on failure as per specifications
        return {
            "status": "success",
            "data": [],
            "count": 0
        }


@router.get("/training-videos")
def get_training_videos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    Get training video list ordered by class name and sort order.
    Returns all training videos from the training_videos table.
    """
    try:
        training_videos = db.execute(text(
            "SELECT * FROM training_videos ORDER BY class_name, sort_order"
        )).fetchall()

        videos_list = []
        for row in training_videos:
            video = {}
            for key in row._mapping.keys():
                video[key] = getattr(row, key, None)
            videos_list.append(video)

        return {
            "status": "success",
            "data": videos_list,
            "count": len(videos_list)
        }
    except Exception as e:
        # Return empty list on failure as per specifications
        return {
            "status": "success",
            "data": [],
            "count": 0
        }

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_admin_user
from typing import Optional

router = APIRouter(prefix="/members", tags=["members"])


@router.get("/search")
def search_members(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    search: Optional[str] = None,
    site_id: Optional[int] = None,
):
    """Search wholesale/membership members."""
    try:
        # Try wholesale_members table first
        query = (
            "SELECT id, company_name as name, contact_email as email, "
            "contact_phone as phone, status, created_at "
            "FROM wholesale_members"
        )
        params = {}

        if search:
            query += " WHERE company_name LIKE :search OR contact_email LIKE :search"
            params["search"] = f"%{search}%"

        query += " ORDER BY company_name LIMIT 100"

        result = db.execute(text(query), params).fetchall()
        members = [
            {
                "id": row.id,
                "name": row.name or '',
                "email": row.email or '',
                "phone": row.phone or '',
                "status": row.status or '',
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in result
        ]
        return {"data": members}
    except Exception as e:
        if "doesn't exist" in str(e).lower():
            return {"data": []}
        return {"data": []}

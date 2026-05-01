from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_admin_user
from typing import Optional

router = APIRouter(prefix="/au", tags=["au"])


@router.get("/documents")
def get_au_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get Account Updater documents."""
    try:
        # Try au_documents table
        try:
            result = db.execute(text(
                "SELECT id, name, file_path, status, created_at "
                "FROM au_documents ORDER BY created_at DESC LIMIT 100"
            )).fetchall()
            documents = [
                {
                    "id": row.id,
                    "name": row.name or '',
                    "file_path": row.file_path or '',
                    "status": row.status or '',
                    "created_at": row.created_at.isoformat() if row.created_at else None,
                }
                for row in result
            ]
            return {"data": documents}
        except Exception:
            pass

        # Try au_uploads table as fallback
        try:
            result = db.execute(text(
                "SELECT id, filename as name, upload_date as created_at, status "
                "FROM au_uploads ORDER BY upload_date DESC LIMIT 100"
            )).fetchall()
            documents = [
                {
                    "id": row.id,
                    "name": row.name or '',
                    "status": row.status or '',
                    "created_at": row.created_at.isoformat() if row.created_at else None,
                }
                for row in result
            ]
            return {"data": documents}
        except Exception:
            pass

        return {"data": []}
    except Exception as e:
        return {"data": []}

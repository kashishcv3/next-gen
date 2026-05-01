from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_admin_user

router = APIRouter(prefix="/fulfillment", tags=["fulfillment"])


@router.get("/options")
def get_fulfillment_options(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    site_id: int = Query(...),
):
    """Get fulfillment options for a store."""
    try:
        # Try to get fulfillment options from central DB
        try:
            result = db.execute(text(
                "SELECT option_key, option_value FROM fulfillment_options "
                "WHERE site_id = :site_id ORDER BY option_key"
            ), {"site_id": site_id}).fetchall()
            options = {row.option_key: row.option_value for row in result}
            return {"data": options}
        except Exception:
            # Table might not exist - return defaults
            return {"data": {
                "fulfillment_enabled": "n",
                "fulfillment_service": "",
                "fulfillment_api_key": "",
                "fulfillment_warehouse": "",
                "auto_fulfill": "n",
                "send_tracking": "y",
                "fulfillment_email_notify": "y",
            }}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/options")
def update_fulfillment_options(
    options: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    site_id: int = Query(...),
):
    """Update fulfillment options."""
    try:
        # Try to create table if it doesn't exist
        try:
            db.execute(text("""
                CREATE TABLE IF NOT EXISTS fulfillment_options (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    site_id INT NOT NULL,
                    option_key VARCHAR(100) NOT NULL,
                    option_value TEXT,
                    UNIQUE KEY uk_site_key (site_id, option_key)
                )
            """))
            db.commit()
        except Exception:
            pass

        for key, value in options.items():
            try:
                db.execute(text(
                    "INSERT INTO fulfillment_options (site_id, option_key, option_value) "
                    "VALUES (:site_id, :key, :value) "
                    "ON DUPLICATE KEY UPDATE option_value = :value"
                ), {"site_id": site_id, "key": key, "value": value})
            except Exception:
                pass
        db.commit()
        return {"message": "Fulfillment options updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

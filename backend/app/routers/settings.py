from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_admin_user
from datetime import datetime

router = APIRouter(prefix="/settings", tags=["settings"])


class SettingItem(BaseModel):
    key: str
    value: Optional[str]
    description: Optional[str] = None

    class Config:
        from_attributes = True


class PaymentOption(BaseModel):
    gateway_name: str
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    enabled: bool = False
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class StoreOption(BaseModel):
    option_key: str
    option_value: str
    category: Optional[str] = None

    class Config:
        from_attributes = True


# GENERAL SETTINGS
@router.get("/general")
def get_general_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get general store settings."""
    try:
        result = db.execute(text(
            "SELECT option_key, option_value FROM store_settings WHERE category = 'general' ORDER BY option_key"
        )).fetchall()

        settings = {row.option_key: row.option_value for row in result}
        return {"data": settings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/general")
def update_general_settings(
    settings: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update general store settings."""
    try:
        for key, value in settings.items():
            db.execute(text(
                "INSERT INTO store_settings (option_key, option_value, category, updated_at) "
                "VALUES (:key, :value, 'general', :updated_at) "
                "ON DUPLICATE KEY UPDATE option_value = :value, updated_at = :updated_at"
            ), {
                "key": key,
                "value": str(value),
                "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            })
        db.commit()

        return {"message": "General settings updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# PAYMENT OPTIONS
@router.get("/payment")
def get_payment_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get payment gateway settings."""
    try:
        result = db.execute(text(
            "SELECT id, gateway_name, api_key, api_secret, enabled, created_at FROM payment_gateways ORDER BY gateway_name"
        )).fetchall()

        gateways = [
            {
                "id": row.id,
                "gateway_name": row.gateway_name,
                "api_key": row.api_key,
                "api_secret": row.api_secret,
                "enabled": row.enabled == 'y',
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in result
        ]
        return {"data": gateways}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/payment")
def update_payment_settings(
    gateway: PaymentOption,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Create or update payment gateway settings."""
    try:
        db.execute(text(
            "INSERT INTO payment_gateways (gateway_name, api_key, api_secret, enabled, created_at) "
            "VALUES (:gateway_name, :api_key, :api_secret, :enabled, :created_at) "
            "ON DUPLICATE KEY UPDATE api_key = :api_key, api_secret = :api_secret, enabled = :enabled"
        ), {
            "gateway_name": gateway.gateway_name,
            "api_key": gateway.api_key,
            "api_secret": gateway.api_secret,
            "enabled": 'y' if gateway.enabled else 'n',
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        })
        db.commit()

        return {"message": "Payment settings updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# STORE OPTIONS
@router.get("/store-options")
def get_store_options(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    category: Optional[str] = None,
):
    """Get store options by category."""
    try:
        query = "SELECT option_key, option_value, category FROM store_options"
        params = {}

        if category:
            query += " WHERE category = :category"
            params["category"] = category

        query += " ORDER BY option_key"

        result = db.execute(text(query), params).fetchall()

        options = [
            {
                "option_key": row.option_key,
                "option_value": row.option_value,
                "category": row.category,
            }
            for row in result
        ]
        return {"data": options}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/store-options")
def update_store_options(
    option: StoreOption,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Create or update store option."""
    try:
        db.execute(text(
            "INSERT INTO store_options (option_key, option_value, category) "
            "VALUES (:key, :value, :category) "
            "ON DUPLICATE KEY UPDATE option_value = :value"
        ), {
            "key": option.option_key,
            "value": option.option_value,
            "category": option.category or "general",
        })
        db.commit()

        return {"message": "Store option updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# SECURITY SETTINGS
@router.get("/security")
def get_security_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get security settings."""
    try:
        result = db.execute(text(
            "SELECT option_key, option_value FROM store_settings WHERE category = 'security' ORDER BY option_key"
        )).fetchall()

        settings = {row.option_key: row.option_value for row in result}
        return {"data": settings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/security")
def update_security_settings(
    settings: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update security settings."""
    try:
        for key, value in settings.items():
            db.execute(text(
                "INSERT INTO store_settings (option_key, option_value, category, updated_at) "
                "VALUES (:key, :value, 'security', :updated_at) "
                "ON DUPLICATE KEY UPDATE option_value = :value, updated_at = :updated_at"
            ), {
                "key": key,
                "value": str(value),
                "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            })
        db.commit()

        return {"message": "Security settings updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

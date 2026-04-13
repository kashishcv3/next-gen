from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_admin_user

router = APIRouter(prefix="/settings", tags=["settings"])


class SettingItem(BaseModel):
    key: str
    value: Optional[str]
    description: Optional[str]

    class Config:
        from_attributes = True


class SettingsList(BaseModel):
    items: list[SettingItem]


@router.get("", response_model=SettingsList)
def get_all_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    return SettingsList(items=[])


@router.get("/{setting_key}")
def get_setting(
    setting_key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    return {
        "key": setting_key,
        "value": None,
        "description": None,
    }

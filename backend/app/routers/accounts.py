from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserOut, UserList
from app.dependencies import get_current_user
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/accounts", tags=["accounts"])


class AccountInfo(BaseModel):
    uid: int
    username: str
    email: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    co_name: Optional[str]
    user_type: Optional[str]
    phone: Optional[str]
    timestamp: Optional[datetime]
    last_login: Optional[datetime]
    inactive: bool
    in_cloud: bool

    class Config:
        from_attributes = True


class AccountLogEntry(BaseModel):
    timestamp: datetime
    action: str
    details: Optional[str]


@router.get("", response_model=UserList)
def list_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    skip = (page - 1) * page_size

    total = db.query(User).count()
    users = db.query(User).offset(skip).limit(page_size).all()

    return UserList(
        total=total,
        page=page,
        page_size=page_size,
        items=[UserOut.model_validate(user) for user in users],
    )


@router.get("/{uid}/info", response_model=AccountInfo)
def get_account_info(
    uid: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.uid == uid).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )

    return AccountInfo(
        uid=user.uid,
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        co_name=user.co_name,
        user_type=user.user_type,
        phone=user.phone,
        timestamp=user.timestamp,
        last_login=user.last_login,
        inactive=user.inactive,
        in_cloud=user.in_cloud,
    )


@router.get("/{uid}/log")
def get_account_log(
    uid: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=500),
):
    user = db.query(User).filter(User.uid == uid).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )

    return {
        "uid": uid,
        "username": user.username,
        "log_entries": [],
        "total_entries": 0,
    }

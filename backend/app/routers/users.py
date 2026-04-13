from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserOut, UserList
from app.dependencies import get_current_admin_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=UserList)
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
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


@router.get("/{uid}", response_model=UserOut)
def get_user(
    uid: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    user = db.query(User).filter(User.uid == uid).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserOut.model_validate(user)

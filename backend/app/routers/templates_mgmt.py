from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_admin_user

router = APIRouter(prefix="/templates", tags=["templates"])


class TemplateItem(BaseModel):
    id: int
    name: str
    type: str
    last_modified: Optional[str]

    class Config:
        from_attributes = True


class TemplateDetail(BaseModel):
    id: int
    name: str
    type: str
    content: Optional[str]
    created_date: Optional[str]
    last_modified: Optional[str]

    class Config:
        from_attributes = True


class TemplateList(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[TemplateItem]


@router.get("", response_model=TemplateList)
def list_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    template_type: Optional[str] = None,
):
    return TemplateList(
        total=0,
        page=page,
        page_size=page_size,
        items=[],
    )


@router.get("/{template_id}", response_model=TemplateDetail)
def get_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    return {
        "id": template_id,
        "name": "Unknown Template",
        "type": "unknown",
        "content": None,
        "created_date": None,
        "last_modified": None,
    }

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_user

router = APIRouter(prefix="/categories", tags=["categories"])


class CategoryItem(BaseModel):
    id: int
    name: str
    slug: Optional[str]
    product_count: int

    class Config:
        from_attributes = True


class CategoryDetail(BaseModel):
    id: int
    name: str
    slug: Optional[str]
    description: Optional[str]
    parent_id: Optional[int]
    product_count: int
    status: str

    class Config:
        from_attributes = True


class CategoryList(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[CategoryItem]


@router.get("", response_model=CategoryList)
def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    return CategoryList(
        total=0,
        page=page,
        page_size=page_size,
        items=[],
    )


@router.get("/{category_id}", response_model=CategoryDetail)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {
        "id": category_id,
        "name": "Unknown Category",
        "slug": None,
        "description": None,
        "parent_id": None,
        "product_count": 0,
        "status": "unknown",
    }

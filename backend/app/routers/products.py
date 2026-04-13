from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_user

router = APIRouter(prefix="/products", tags=["products"])


class ProductItem(BaseModel):
    id: int
    name: str
    sku: Optional[str]
    price: Optional[float]
    status: str

    class Config:
        from_attributes = True


class ProductDetail(BaseModel):
    id: int
    name: str
    sku: Optional[str]
    price: Optional[float]
    description: Optional[str]
    status: str
    created_at: Optional[str]

    class Config:
        from_attributes = True


class ProductList(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[ProductItem]


@router.get("", response_model=ProductList)
def list_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
):
    return ProductList(
        total=0,
        page=page,
        page_size=page_size,
        items=[],
    )


@router.get("/{product_id}", response_model=ProductDetail)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {
        "id": product_id,
        "name": "Product Not Found",
        "sku": None,
        "price": 0.0,
        "description": None,
        "status": "unknown",
        "created_at": None,
    }


@router.get("/search/by-name")
def search_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    q: str = Query("", min_length=1),
    limit: int = Query(20, ge=1, le=100),
):
    return {
        "query": q,
        "total": 0,
        "items": [],
    }

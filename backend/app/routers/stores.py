from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_user

router = APIRouter(prefix="/stores", tags=["stores"])


class StoreItem(BaseModel):
    id: int
    name: str
    status: str
    orders_count: int

    class Config:
        from_attributes = True


class StoreOverview(BaseModel):
    id: int
    name: str
    status: str
    domain: Optional[str]
    owner: Optional[str]
    total_orders: int
    total_revenue: float
    product_count: int
    created_date: Optional[str]

    class Config:
        from_attributes = True


class StoreList(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[StoreItem]


@router.get("", response_model=StoreList)
def list_stores(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    return StoreList(
        total=0,
        page=page,
        page_size=page_size,
        items=[],
    )


@router.get("/{store_id}/overview", response_model=StoreOverview)
def get_store_overview(
    store_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {
        "id": store_id,
        "name": "Unknown Store",
        "status": "unknown",
        "domain": None,
        "owner": None,
        "total_orders": 0,
        "total_revenue": 0.0,
        "product_count": 0,
        "created_date": None,
    }

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])


class OrderItem(BaseModel):
    id: int
    order_number: str
    customer_name: Optional[str]
    total: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class OrderDetail(BaseModel):
    id: int
    order_number: str
    customer_name: Optional[str]
    customer_email: Optional[str]
    total: float
    status: str
    items_count: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class OrderList(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[OrderItem]


@router.get("", response_model=OrderList)
def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
):
    return OrderList(
        total=0,
        page=page,
        page_size=page_size,
        items=[],
    )


@router.get("/{order_id}", response_model=OrderDetail)
def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {
        "id": order_id,
        "order_number": f"ORD-{order_id}",
        "customer_name": None,
        "customer_email": None,
        "total": 0.0,
        "status": "unknown",
        "items_count": 0,
        "created_at": datetime.now(),
        "updated_at": None,
    }

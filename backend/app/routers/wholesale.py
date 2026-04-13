from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_admin_user

router = APIRouter(prefix="/wholesale", tags=["wholesale"])


class WholesaleCustomer(BaseModel):
    id: int
    name: str
    email: Optional[str]
    status: str
    total_orders: int

    class Config:
        from_attributes = True


class WholesaleOrder(BaseModel):
    id: int
    order_number: str
    customer_name: Optional[str]
    total: float
    status: str
    created_date: Optional[str]

    class Config:
        from_attributes = True


@router.get("/customers")
def list_wholesale_customers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    return {
        "total": 0,
        "page": page,
        "page_size": page_size,
        "items": [],
    }


@router.get("/customers/{customer_id}")
def get_wholesale_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    return {
        "id": customer_id,
        "name": "Unknown Customer",
        "email": None,
        "status": "unknown",
        "total_orders": 0,
    }


@router.get("/orders")
def list_wholesale_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    customer_id: Optional[int] = None,
):
    return {
        "total": 0,
        "page": page,
        "page_size": page_size,
        "items": [],
    }


@router.get("/pricing")
def get_wholesale_pricing(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    product_id: Optional[int] = None,
):
    return {
        "items": [],
    }

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_admin_user

router = APIRouter(prefix="/shipping", tags=["shipping"])


class ShippingMethod(BaseModel):
    id: int
    name: str
    cost: float
    delivery_days: Optional[int]

    class Config:
        from_attributes = True


class ShippingCarrier(BaseModel):
    id: int
    name: str
    api_key: Optional[str]
    status: str

    class Config:
        from_attributes = True


@router.get("/methods")
def get_shipping_methods(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    return {
        "items": [],
    }


@router.get("/carriers")
def get_shipping_carriers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    return {
        "items": [],
    }


@router.get("/rates")
def get_shipping_rates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    destination: Optional[str] = None,
    weight: Optional[float] = None,
):
    return {
        "rates": [],
    }


@router.get("/tracking/{tracking_number}")
def get_tracking_info(
    tracking_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    return {
        "tracking_number": tracking_number,
        "carrier": None,
        "status": "unknown",
        "events": [],
    }

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_admin_user

router = APIRouter(prefix="/reports", tags=["reports"])


class ReportOverview(BaseModel):
    total_orders: int
    total_revenue: float
    total_customers: int
    average_order_value: float
    period: str


class SalesData(BaseModel):
    date: str
    revenue: float
    orders: int
    items_sold: int


class SalesReport(BaseModel):
    period: str
    total_revenue: float
    total_orders: int
    average_order_value: float
    data: List[SalesData]


@router.get("/overview", response_model=ReportOverview)
def get_reports_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    period: str = Query("month", regex="^(day|week|month|year)$"),
):
    return ReportOverview(
        total_orders=0,
        total_revenue=0.0,
        total_customers=0,
        average_order_value=0.0,
        period=period,
    )


@router.get("/sales", response_model=SalesReport)
def get_sales_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    granularity: str = Query("day", regex="^(day|week|month)$"),
):
    return SalesReport(
        period="custom",
        total_revenue=0.0,
        total_orders=0,
        average_order_value=0.0,
        data=[],
    )

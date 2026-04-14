from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_admin_user

router = APIRouter(prefix="/reports", tags=["reports"])


# Overview Models
class ReportOverview(BaseModel):
    total_orders: int
    total_revenue: float
    total_customers: int
    average_order_value: float
    period: str


# Sales Rank Report
class SalesRankItem(BaseModel):
    product_id: int
    product_name: str
    quantity_sold: int
    revenue: float


class SalesRankReport(BaseModel):
    period: str
    total_items: int
    items: List[SalesRankItem]


# Visitors Report
class VisitorData(BaseModel):
    date: str
    unique_visitors: int
    page_views: int
    sessions: int


class VisitorsReport(BaseModel):
    period: str
    total_visitors: int
    total_sessions: int
    total_pageviews: int
    data: List[VisitorData]


# Referrers Report
class ReferrerItem(BaseModel):
    referrer: str
    visits: int
    revenue: float
    orders: int


class ReferrersReport(BaseModel):
    period: str
    total_referrers: int
    items: List[ReferrerItem]


# Search Terms Report
class SearchTermItem(BaseModel):
    search_term: str
    searches: int
    results_found: int
    orders: int


class SearchTermsReport(BaseModel):
    period: str
    total_searches: int
    items: List[SearchTermItem]


# Cart Abandonment Report
class CartAbandonmentItem(BaseModel):
    cart_id: int
    customer_email: str
    cart_value: float
    items_count: int
    abandoned_date: str
    recovered: bool


class CartAbandonmentReport(BaseModel):
    period: str
    total_abandoned: int
    total_value: float
    items: List[CartAbandonmentItem]


# Gift Certificates Report
class GiftCertificateItem(BaseModel):
    certificate_id: int
    amount: float
    recipient_email: str
    created_date: str
    used_date: Optional[str] = None
    status: str


class GiftCertificatesReport(BaseModel):
    period: str
    total_issued: int
    total_value: float
    items: List[GiftCertificateItem]


# Inventory Notify Report
class InventoryNotifyItem(BaseModel):
    product_id: int
    product_name: str
    email: str
    notify_date: str
    notified: bool


class InventoryNotifyReport(BaseModel):
    total_requests: int
    items: List[InventoryNotifyItem]


@router.get("/overview", response_model=ReportOverview)
def get_reports_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    period: str = Query("month", regex="^(day|week|month|year)$"),
):
    try:
        # Calculate date range
        now = datetime.now()
        if period == "day":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "week":
            start_date = now - timedelta(days=now.weekday())
            start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "month":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:  # year
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

        # Get order statistics
        query = text("""
            SELECT
                COUNT(DISTINCT order_id) as total_orders,
                SUM(total_price) as total_revenue,
                COUNT(DISTINCT customer_id) as total_customers,
                AVG(total_price) as avg_order_value
            FROM full_order
            WHERE date_ordered >= :start_date
            AND (status NOT LIKE '%delete%' OR status IS NULL)
        """)

        result = db.execute(query, {"start_date": start_date}).first()

        return ReportOverview(
            total_orders=int(result.total_orders or 0),
            total_revenue=float(result.total_revenue or 0),
            total_customers=int(result.total_customers or 0),
            average_order_value=float(result.avg_order_value or 0),
            period=period,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching report overview: {str(e)}")


@router.get("/sales-rank", response_model=SalesRankReport)
def get_sales_rank_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    period: str = Query("month", regex="^(day|week|month|year)$"),
    limit: int = Query(50, ge=1, le=500),
):
    try:
        now = datetime.now()
        if period == "day":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "week":
            start_date = now - timedelta(days=now.weekday())
            start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "month":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

        query = text("""
            SELECT
                oi.prod_id as product_id,
                p.prod_name as product_name,
                SUM(oi.quantity) as quantity_sold,
                SUM(oi.price * oi.quantity) as revenue
            FROM order_items oi
            JOIN products p ON oi.prod_id = p.prod_id
            JOIN full_order fo ON oi.order_id = fo.order_id
            WHERE fo.date_ordered >= :start_date
            AND (fo.status NOT LIKE '%delete%' OR fo.status IS NULL)
            GROUP BY oi.prod_id, p.prod_name
            ORDER BY revenue DESC
            LIMIT :limit
        """)

        result = db.execute(query, {"start_date": start_date, "limit": limit})
        items = []
        for row in result:
            items.append({
                "product_id": row.product_id,
                "product_name": row.product_name,
                "quantity_sold": int(row.quantity_sold or 0),
                "revenue": float(row.revenue or 0),
            })

        return SalesRankReport(period=period, total_items=len(items), items=items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sales rank: {str(e)}")


@router.get("/visitors", response_model=VisitorsReport)
def get_visitors_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    period: str = Query("month", regex="^(day|week|month|year)$"),
):
    try:
        now = datetime.now()
        if period == "day":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            date_format = "%Y-%m-%d %H:00"
        elif period == "week":
            start_date = now - timedelta(days=now.weekday())
            start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
            date_format = "%Y-%m-%d"
        elif period == "month":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            date_format = "%Y-%m-%d"
        else:
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            date_format = "%Y-%m"

        query = text(f"""
            SELECT
                DATE_FORMAT(visit_date, '{date_format}') as date,
                COUNT(DISTINCT visitor_id) as unique_visitors,
                COUNT(*) as page_views,
                COUNT(DISTINCT session_id) as sessions
            FROM visitors_log
            WHERE visit_date >= :start_date
            GROUP BY DATE_FORMAT(visit_date, '{date_format}')
            ORDER BY date
        """)

        result = db.execute(query, {"start_date": start_date})
        items = []
        total_visitors = 0
        total_sessions = 0
        total_pageviews = 0

        for row in result:
            items.append({
                "date": row.date,
                "unique_visitors": int(row.unique_visitors or 0),
                "page_views": int(row.page_views or 0),
                "sessions": int(row.sessions or 0),
            })
            total_visitors += int(row.unique_visitors or 0)
            total_sessions += int(row.sessions or 0)
            total_pageviews += int(row.page_views or 0)

        return VisitorsReport(
            period=period,
            total_visitors=total_visitors,
            total_sessions=total_sessions,
            total_pageviews=total_pageviews,
            data=items,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching visitors: {str(e)}")


@router.get("/referrers", response_model=ReferrersReport)
def get_referrers_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    period: str = Query("month", regex="^(day|week|month|year)$"),
    limit: int = Query(50, ge=1, le=500),
):
    try:
        now = datetime.now()
        if period == "day":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "week":
            start_date = now - timedelta(days=now.weekday())
            start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "month":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

        query = text("""
            SELECT
                vl.referrer_url as referrer,
                COUNT(*) as visits,
                COALESCE(SUM(fo.total_price), 0) as revenue,
                COUNT(DISTINCT fo.order_id) as orders
            FROM visitors_log vl
            LEFT JOIN full_order fo ON vl.visitor_id = fo.customer_id
                AND fo.date_ordered >= vl.visit_date
            WHERE vl.visit_date >= :start_date
            GROUP BY vl.referrer_url
            ORDER BY visits DESC
            LIMIT :limit
        """)

        result = db.execute(query, {"start_date": start_date, "limit": limit})
        items = []
        for row in result:
            items.append({
                "referrer": row.referrer or "Direct",
                "visits": int(row.visits or 0),
                "revenue": float(row.revenue or 0),
                "orders": int(row.orders or 0),
            })

        return ReferrersReport(period=period, total_referrers=len(items), items=items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching referrers: {str(e)}")


@router.get("/search-terms", response_model=SearchTermsReport)
def get_search_terms_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    period: str = Query("month", regex="^(day|week|month|year)$"),
    limit: int = Query(50, ge=1, le=500),
):
    try:
        now = datetime.now()
        if period == "day":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "week":
            start_date = now - timedelta(days=now.weekday())
            start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "month":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

        query = text("""
            SELECT
                search_term,
                COUNT(*) as searches,
                SUM(CASE WHEN results_found > 0 THEN 1 ELSE 0 END) as results_found,
                COUNT(DISTINCT order_id) as orders
            FROM search_log
            WHERE search_date >= :start_date
            GROUP BY search_term
            ORDER BY searches DESC
            LIMIT :limit
        """)

        result = db.execute(query, {"start_date": start_date, "limit": limit})
        items = []
        total_searches = 0

        for row in result:
            items.append({
                "search_term": row.search_term,
                "searches": int(row.searches or 0),
                "results_found": int(row.results_found or 0),
                "orders": int(row.orders or 0),
            })
            total_searches += int(row.searches or 0)

        return SearchTermsReport(period=period, total_searches=total_searches, items=items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching search terms: {str(e)}")


@router.get("/cart-abandonment", response_model=CartAbandonmentReport)
def get_cart_abandonment_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    period: str = Query("month", regex="^(day|week|month|year)$"),
    limit: int = Query(50, ge=1, le=500),
):
    try:
        now = datetime.now()
        if period == "day":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "week":
            start_date = now - timedelta(days=now.weekday())
            start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "month":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

        query = text("""
            SELECT
                cart_id,
                customer_email,
                cart_value,
                item_count as items_count,
                abandoned_date,
                CASE WHEN recovered_date IS NOT NULL THEN 1 ELSE 0 END as recovered
            FROM cart_abandonment_info
            WHERE abandoned_date >= :start_date
            ORDER BY abandoned_date DESC
            LIMIT :limit
        """)

        result = db.execute(query, {"start_date": start_date, "limit": limit})
        items = []
        total_abandoned = 0
        total_value = 0.0

        for row in result:
            items.append({
                "cart_id": row.cart_id,
                "customer_email": row.customer_email,
                "cart_value": float(row.cart_value or 0),
                "items_count": int(row.items_count or 0),
                "abandoned_date": row.abandoned_date.isoformat() if row.abandoned_date else None,
                "recovered": bool(row.recovered),
            })
            total_abandoned += 1
            total_value += float(row.cart_value or 0)

        return CartAbandonmentReport(period=period, total_abandoned=total_abandoned, total_value=total_value, items=items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching cart abandonment: {str(e)}")


@router.get("/gift-certificates", response_model=GiftCertificatesReport)
def get_gift_certificates_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    period: str = Query("month", regex="^(day|week|month|year)$"),
):
    try:
        now = datetime.now()
        if period == "day":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "week":
            start_date = now - timedelta(days=now.weekday())
            start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "month":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

        query = text("""
            SELECT
                gc_id as certificate_id,
                amount,
                email as recipient_email,
                created_date,
                used_date,
                CASE
                    WHEN used_date IS NOT NULL THEN 'used'
                    WHEN expires_date < NOW() THEN 'expired'
                    ELSE 'active'
                END as status
            FROM gift_certificates
            WHERE created_date >= :start_date
            ORDER BY created_date DESC
        """)

        result = db.execute(query, {"start_date": start_date})
        items = []
        total_issued = 0
        total_value = 0.0

        for row in result:
            items.append({
                "certificate_id": row.certificate_id,
                "amount": float(row.amount or 0),
                "recipient_email": row.recipient_email,
                "created_date": row.created_date.isoformat() if row.created_date else None,
                "used_date": row.used_date.isoformat() if row.used_date else None,
                "status": row.status,
            })
            total_issued += 1
            total_value += float(row.amount or 0)

        return GiftCertificatesReport(period=period, total_issued=total_issued, total_value=total_value, items=items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching gift certificates: {str(e)}")


@router.get("/inventory-notify", response_model=InventoryNotifyReport)
def get_inventory_notify_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    try:
        query = text("""
            SELECT
                prod_id as product_id,
                prod_name as product_name,
                email,
                request_date as notify_date,
                notification_sent as notified
            FROM inventory_notifications
            ORDER BY request_date DESC
            LIMIT 500
        """)

        result = db.execute(query)
        items = []

        for row in result:
            items.append({
                "product_id": row.product_id,
                "product_name": row.product_name,
                "email": row.email,
                "notify_date": row.notify_date.isoformat() if row.notify_date else None,
                "notified": bool(row.notified),
            })

        return InventoryNotifyReport(total_requests=len(items), items=items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching inventory notifications: {str(e)}")

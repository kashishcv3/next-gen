from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])


class OrderItemDetail(BaseModel):
    product_name: str
    sku: str
    quantity: float
    unit_price: float
    total: float


class OrderItem(BaseModel):
    id: int
    order_id: int
    customer_name: str
    customer_email: str
    total_price: float
    status: str
    date_ordered: str
    ip: Optional[str] = None
    payment_method: Optional[str] = None
    invalid: Optional[str] = None
    incomplete: Optional[str] = None

    class Config:
        from_attributes = True


class OrderDetail(BaseModel):
    order_id: int
    customer_name: str
    customer_email: str
    customer_ip: str
    total_price: float
    total_tax: float
    total_shipping: float
    status: str
    date_ordered: str
    date_updated: Optional[str] = None
    payment_method: Optional[str] = None
    payment_gateway: Optional[str] = None
    transaction_id: Optional[str] = None
    billing_address1: str
    billing_address2: Optional[str] = None
    billing_city: str
    billing_state: str
    billing_zip: str
    billing_country: str
    billing_phone: Optional[str] = None
    shipping_name: str
    shipping_address1: str
    shipping_address2: Optional[str] = None
    shipping_city: str
    shipping_state: str
    shipping_zip: str
    shipping_country: str
    shipping_method: Optional[str] = None
    items: List[OrderItemDetail]
    invalid: Optional[str] = None
    incomplete: Optional[str] = None
    tracking: Optional[str] = None
    comments: Optional[str] = None


class OrderList(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[OrderItem]


class OrderOptions(BaseModel):
    order_options: dict


@router.get("", response_model=OrderList)
def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    site_id: int = Query(..., description="Store/site ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    search_by: Optional[str] = None,
    search_for: Optional[str] = None,
    incomplete_paypal: Optional[str] = None,
    use_wildcard: Optional[str] = None,
):
    """
    List orders for the store with optional filtering.
    Requires site_id parameter for store context.
    """
    try:
        skip = (page - 1) * page_size

        # Build the base query
        query = """
            SELECT fo.order_id, fo.order_id as id,
                   CONCAT(ui.first_name, ' ', ui.last_name) as customer_name,
                   ui.email as customer_email,
                   fo.total_price, fo.status,
                   DATE_FORMAT(fo.date_ordered, '%m/%d/%Y %H:%i:%s') as date_ordered,
                   fo.ip, fo.payment_method, fo.invalid, fo.incomplete
            FROM full_order fo
            JOIN user_info ui ON fo.user_id = ui.user_id
            WHERE 1=1
        """

        params = {}

        # Add search filters if provided
        if search_by and search_for:
            if search_by == "order_id":
                if "-" in search_for:
                    parts = search_for.split("-")
                    query += " AND fo.order_id >= :id_from AND fo.order_id <= :id_to"
                    params["id_from"] = int(parts[0].strip())
                    params["id_to"] = int(parts[1].strip())
                else:
                    query += " AND fo.order_id = :order_id"
                    params["order_id"] = int(search_for)
            elif search_by == "email":
                if use_wildcard == "y":
                    query += " AND ui.email LIKE CONCAT('%', :search_for, '%')"
                else:
                    query += " AND ui.email = :search_for"
                params["search_for"] = search_for
            elif search_by == "last_name":
                if use_wildcard == "y":
                    query += " AND ui.last_name LIKE CONCAT('%', :search_for, '%')"
                else:
                    query += " AND ui.last_name = :search_for"
                params["search_for"] = search_for

        # Add date range filter
        if date_from:
            query += " AND fo.date_ordered >= :date_from"
            params["date_from"] = date_from + " 00:00:00"

        if date_to:
            query += " AND fo.date_ordered <= :date_to"
            params["date_to"] = date_to + " 23:59:59"

        # Add status filter
        if status:
            query += " AND fo.status = :status"
            params["status"] = status

        # Add incomplete paypal filter
        if incomplete_paypal == "y":
            query += " AND (fo.payment_method = 'paypal_express' OR fo.payment_method = 'paypal') AND (fo.paypal_buyer = '' OR fo.paypal_buyer IS NULL) AND fo.invalid = 'y'"

        # Count total results
        count_query = f"SELECT COUNT(*) as cnt FROM ({query}) as subquery"
        count_result = db.execute(text(count_query), params).fetchone()
        total = count_result[0] if count_result else 0

        # Add pagination and ordering
        query += " ORDER BY fo.order_id DESC LIMIT :limit OFFSET :offset"
        params["limit"] = page_size
        params["offset"] = skip

        # Execute query
        results = db.execute(text(query), params).fetchall()

        items = []
        for row in results:
            items.append(
                OrderItem(
                    id=row[1],
                    order_id=row[0],
                    customer_name=row[2],
                    customer_email=row[3],
                    total_price=float(row[4]),
                    status=row[5],
                    date_ordered=row[6],
                    ip=row[7],
                    payment_method=row[8],
                    invalid=row[9],
                    incomplete=row[10],
                )
            )

        return OrderList(total=total, page=page, page_size=page_size, items=items)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching orders: {str(e)}",
        )


@router.get("/pending", response_model=OrderList)
def get_pending_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    site_id: int = Query(..., description="Store/site ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """
    Get pending/new orders for the store.
    """
    try:
        skip = (page - 1) * page_size

        query = """
            SELECT COUNT(*) as cnt FROM full_order fo
            JOIN user_info ui ON fo.user_id = ui.user_id
            WHERE fo.status IN ('pending', 'new')
        """

        count_result = db.execute(text(query)).fetchone()
        total = count_result[0] if count_result else 0

        query = """
            SELECT fo.order_id, fo.order_id as id,
                   CONCAT(ui.first_name, ' ', ui.last_name) as customer_name,
                   ui.email as customer_email,
                   fo.total_price, fo.status,
                   DATE_FORMAT(fo.date_ordered, '%m/%d/%Y %H:%i:%s') as date_ordered,
                   fo.ip, fo.payment_method, fo.invalid, fo.incomplete
            FROM full_order fo
            JOIN user_info ui ON fo.user_id = ui.user_id
            WHERE fo.status IN ('pending', 'new')
            ORDER BY fo.date_ordered ASC
            LIMIT :limit OFFSET :offset
        """

        results = db.execute(text(query), {"limit": page_size, "offset": skip}).fetchall()

        items = []
        for row in results:
            items.append(
                OrderItem(
                    id=row[1],
                    order_id=row[0],
                    customer_name=row[2],
                    customer_email=row[3],
                    total_price=float(row[4]),
                    status=row[5],
                    date_ordered=row[6],
                    ip=row[7],
                    payment_method=row[8],
                    invalid=row[9],
                    incomplete=row[10],
                )
            )

        return OrderList(total=total, page=page, page_size=page_size, items=items)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching pending orders: {str(e)}",
        )


@router.get("/{order_id}", response_model=OrderDetail)
def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    site_id: int = Query(..., description="Store/site ID"),
):
    """
    Get detailed information about a specific order.
    """
    try:
        # Get main order information
        query = """
            SELECT fo.order_id, ui.first_name, ui.last_name, ui.email,
                   fo.total_price, fo.total_tax, fo.total_shipping, fo.status,
                   DATE_FORMAT(fo.date_ordered, '%m/%d/%Y %H:%i:%s') as date_ordered,
                   DATE_FORMAT(fo.date_updated, '%m/%d/%Y %H:%i:%s') as date_updated,
                   fo.payment_method, fo.gateway_payment_method as payment_gateway,
                   fo.transaction_id, ui.billing_address1, ui.billing_address2,
                   ui.billing_city, ui.billing_state, ui.billing_zip,
                   ui.billing_country, ui.phone, fo.ip,
                   us.ship_name, us.address1, us.address2, us.city,
                   us.state, us.zip, us.country,
                   sh.method as shipping_method, fo.invalid, fo.incomplete,
                   fo.tracking, fo.comments, fo.trans_id
            FROM full_order fo
            JOIN user_info ui ON fo.user_id = ui.user_id
            LEFT JOIN user_shipping us ON us.user_id = ui.user_id AND us.uship_id = (
                SELECT DISTINCT uship_id FROM order_detail WHERE order_id = :order_id LIMIT 1
            )
            LEFT JOIN shipping sh ON sh.shipper_id = (
                SELECT DISTINCT shipper_id FROM order_detail WHERE order_id = :order_id LIMIT 1
            )
            WHERE fo.order_id = :order_id
        """

        result = db.execute(text(query), {"order_id": order_id}).fetchone()

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
            )

        # Get order items
        items_query = """
            SELECT pr.prod_name, pr.sku, od.quantity,
                   od.unit_price, (od.quantity * od.unit_price) as total
            FROM order_detail od
            JOIN products pr ON od.product_id = pr.prod_id
            WHERE od.order_id = :order_id
        """

        items_results = db.execute(text(items_query), {"order_id": order_id}).fetchall()

        items = []
        for item in items_results:
            items.append(
                OrderItemDetail(
                    product_name=item[0],
                    sku=item[1],
                    quantity=float(item[2]),
                    unit_price=float(item[3]),
                    total=float(item[4]),
                )
            )

        return OrderDetail(
            order_id=result[0],
            customer_name=f"{result[1]} {result[2]}",
            customer_email=result[3],
            total_price=float(result[4]),
            total_tax=float(result[5]),
            total_shipping=float(result[6]),
            status=result[7],
            date_ordered=result[8],
            date_updated=result[9],
            payment_method=result[10],
            payment_gateway=result[11],
            transaction_id=result[12],
            billing_address1=result[13],
            billing_address2=result[14],
            billing_city=result[15],
            billing_state=result[16],
            billing_zip=result[17],
            billing_country=result[18],
            billing_phone=result[19],
            customer_ip=result[20],
            shipping_name=result[21] or "",
            shipping_address1=result[22] or "",
            shipping_address2=result[23],
            shipping_city=result[24] or "",
            shipping_state=result[25] or "",
            shipping_zip=result[26] or "",
            shipping_country=result[27] or "",
            shipping_method=result[28],
            invalid=result[29],
            incomplete=result[30],
            tracking=result[31],
            comments=result[32],
            items=items,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching order detail: {str(e)}",
        )


@router.get("/options/{site_id}")
def get_order_options(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get order settings/options for a store.
    """
    try:
        query = """
            SELECT option_name, option_value
            FROM site_options
            WHERE site_id = :site_id AND option_type = 'order_options'
        """

        results = db.execute(text(query), {"site_id": site_id}).fetchall()

        options = {}
        for row in results:
            options[row[0]] = row[1]

        return OrderOptions(order_options=options)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching order options: {str(e)}",
        )

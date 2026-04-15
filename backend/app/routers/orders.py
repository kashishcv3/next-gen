from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])


class OrderItemDetail(BaseModel):
    product_name: str
    sku: str
    quantity: float
    unit_price: float
    total: float
    od_subscription: Optional[str] = None
    od_subscription_id: Optional[str] = None
    od_subscription_frequency: Optional[str] = None
    od_active_subscription: Optional[str] = None
    extra: Optional[str] = None
    artifi_design_id: Optional[str] = None


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
    tracking: Optional[str] = None
    cs_note: Optional[str] = None
    active: Optional[str] = None

    class Config:
        from_attributes = True


class ShipToAddress(BaseModel):
    uship_id: int
    ship_name: str
    address1: str
    address2: Optional[str] = None
    city: str
    state: str
    zip: str
    country: str
    message: Optional[str] = None
    subtotal: float
    detail_tax: float
    detail_ship: float
    gifttotal: float
    products: List[OrderItemDetail]


class OrderDetail(BaseModel):
    order_id: int
    customer_name: str
    customer_email: str
    customer_ip: str
    total_price: float
    total_tax: float
    total_shipping: float
    total_fees: float = 0
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
    active: Optional[str] = None
    subtotal: float = 0
    discount: float = 0
    discount_type: Optional[str] = None
    gifttotal: float = 0
    cust_1: Optional[str] = None
    cust_2: Optional[str] = None
    cust_3: Optional[str] = None
    comments: Optional[str] = None
    order_details: List[ShipToAddress]
    items: List[OrderItemDetail]
    invalid: Optional[str] = None
    incomplete: Optional[str] = None
    tracking: Optional[str] = None


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
    amazon_pay: Optional[str] = None,
    amazon_pay_status: Optional[str] = None,
    amazon_pay_orderid: Optional[str] = None,
    subscription_orders: Optional[str] = None,
    use_wildcard: Optional[str] = None,
):
    """
    List orders for the store with optional filtering.
    Requires site_id parameter for store context.
    """
    store_db = None
    try:
        skip = (page - 1) * page_size

        # Get per-store database connection
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store database not found for this site",
            )

        store_db = get_store_session(store_db_name)

        # Build the base query
        query = """
            SELECT fo.order_id, fo.order_id as id,
                   CONCAT(ui.first_name, ' ', ui.last_name) as customer_name,
                   ui.email as customer_email,
                   fo.total_price, fo.status,
                   DATE_FORMAT(fo.date_ordered, '%m/%d/%Y %H:%i:%s') as date_ordered,
                   fo.ip, fo.payment_method, fo.invalid, fo.incomplete,
                   fo.tracking, fo.customer_service_note as cs_note, COALESCE(ui.active, '0') as active
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
            elif search_by == "email" or search_by == "ui.email":
                if use_wildcard == "y":
                    query += " AND ui.email LIKE CONCAT('%', :search_for, '%')"
                else:
                    query += " AND ui.email = :search_for"
                params["search_for"] = search_for
            elif search_by == "last_name" or search_by == "ui.last_name":
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
            query += " AND (fo.payment_method = 'paypal_express' OR fo.payment_method = 'paypal') AND (fo.paypal_buyer = '' OR fo.paypal_buyer IS NULL)"

        # Add Amazon Pay filter
        if amazon_pay == "y":
            query += " AND fo.payment_method = 'amazon_pay'"
            if amazon_pay_status:
                query += " AND fo.amazon_pay_status = :amazon_pay_status"
                params["amazon_pay_status"] = amazon_pay_status
            if amazon_pay_orderid:
                query += " AND fo.amazon_order_id = :amazon_pay_orderid"
                params["amazon_pay_orderid"] = amazon_pay_orderid

        # Add subscription orders filter
        if subscription_orders == "y":
            query += " AND EXISTS (SELECT 1 FROM order_detail od JOIN product_subscription ps ON od.product_id = ps.product_id WHERE od.order_id = fo.order_id)"

        # Count total results
        count_query = f"SELECT COUNT(*) as cnt FROM ({query}) as subquery"
        count_result = store_db.execute(text(count_query), params).fetchone()
        total = count_result[0] if count_result else 0

        # Add pagination and ordering
        query += " ORDER BY fo.order_id DESC LIMIT :limit OFFSET :offset"
        params["limit"] = page_size
        params["offset"] = skip

        # Execute query
        results = store_db.execute(text(query), params).fetchall()

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
                    tracking=row[11],
                    cs_note=row[12],
                    active=row[13],
                )
            )

        return OrderList(total=total, page=page, page_size=page_size, items=items)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching orders: {str(e)}",
        )
    finally:
        if store_db:
            store_db.close()


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
    store_db = None
    try:
        skip = (page - 1) * page_size

        # Get per-store database connection
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store database not found for this site",
            )

        store_db = get_store_session(store_db_name)

        query = """
            SELECT COUNT(*) as cnt FROM full_order fo
            JOIN user_info ui ON fo.user_id = ui.user_id
            WHERE fo.status IN ('pending', 'new')
        """

        count_result = store_db.execute(text(query)).fetchone()
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

        results = store_db.execute(text(query), {"limit": page_size, "offset": skip}).fetchall()

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

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching pending orders: {str(e)}",
        )
    finally:
        if store_db:
            store_db.close()


@router.get("/{order_id}", response_model=OrderDetail)
def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    site_id: int = Query(..., description="Store/site ID"),
):
    """
    Get detailed information about a specific order with multiple shipping addresses.
    """
    store_db = None
    try:
        # Get per-store database connection
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store database not found for this site",
            )

        store_db = get_store_session(store_db_name)

        # Get main order information
        query = """
            SELECT fo.order_id, ui.first_name, ui.last_name, ui.email,
                   fo.total_price, fo.total_tax, fo.total_shipping, fo.status,
                   DATE_FORMAT(fo.date_ordered, '%m/%d/%Y %H:%i:%s') as date_ordered,
                   DATE_FORMAT(fo.date_updated, '%m/%d/%Y %H:%i:%s') as date_updated,
                   fo.payment_method, fo.gateway_payment_method as payment_gateway,
                   fo.transaction_id, ui.billing_address1, ui.billing_address2,
                   ui.billing_city, ui.billing_state, ui.billing_zip,
                   ui.billing_country, ui.phone, fo.ip, fo.invalid, fo.incomplete,
                   fo.tracking, fo.comments, fo.subtotal, fo.discount, fo.discount_type,
                   fo.gift_total, fo.total_fees, COALESCE(ui.active, '0') as active,
                   ui.custom_field_1 as cust_1, ui.custom_field_2 as cust_2, ui.custom_field_3 as cust_3
            FROM full_order fo
            JOIN user_info ui ON fo.user_id = ui.user_id
            WHERE fo.order_id = :order_id
        """

        result = store_db.execute(text(query), {"order_id": order_id}).fetchone()

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
            )

        # Get all shipping addresses for this order
        shipto_query = """
            SELECT DISTINCT us.uship_id, us.ship_name, us.address1, us.address2,
                   us.city, us.state, us.zip, us.country,
                   COALESCE(us.message, '') as message
            FROM order_detail od
            JOIN user_shipping us ON od.uship_id = us.uship_id
            WHERE od.order_id = :order_id
            GROUP BY us.uship_id
            ORDER BY us.uship_id
        """

        shipto_results = store_db.execute(text(shipto_query), {"order_id": order_id}).fetchall()

        order_details = []
        items_list = []

        for shipto in shipto_results:
            uship_id = shipto[0]

            # Get items for this shipping address
            items_query = """
                SELECT pr.prod_name, pr.sku, od.quantity,
                       od.unit_price, (od.quantity * od.unit_price) as total,
                       COALESCE(od.od_subscription, '') as od_subscription,
                       COALESCE(od.subscription_id, '') as od_subscription_id,
                       COALESCE(od.subscription_frequency, '') as od_subscription_frequency,
                       COALESCE(od.subscription_active, '') as od_active_subscription,
                       COALESCE(od.extra_options, '') as extra,
                       COALESCE(od.artifi_design_id, '') as artifi_design_id
                FROM order_detail od
                JOIN products pr ON od.product_id = pr.prod_id
                WHERE od.order_id = :order_id AND od.uship_id = :uship_id
            """

            items_results = store_db.execute(text(items_query), {"order_id": order_id, "uship_id": uship_id}).fetchall()

            items = []
            subtotal = 0
            for item in items_results:
                item_detail = OrderItemDetail(
                    product_name=item[0],
                    sku=item[1],
                    quantity=float(item[2]),
                    unit_price=float(item[3]),
                    total=float(item[4]),
                    od_subscription=item[5],
                    od_subscription_id=item[6],
                    od_subscription_frequency=item[7],
                    od_active_subscription=item[8],
                    extra=item[9],
                    artifi_design_id=item[10],
                )
                items.append(item_detail)
                subtotal += float(item[4])
                items_list.append(item_detail)

            # Get shipping details for this address
            shipping_query = """
                SELECT COALESCE(sh.method, '') as method, COALESCE(od.tax, 0) as tax, COALESCE(od.shipping_cost, 0) as shipping_cost,
                       COALESCE(od.gift_wrap_cost, 0) as gift_wrap_cost
                FROM order_detail od
                LEFT JOIN shipping sh ON od.shipper_id = sh.shipper_id
                WHERE od.order_id = :order_id AND od.uship_id = :uship_id
                LIMIT 1
            """

            shipping_result = store_db.execute(text(shipping_query), {"order_id": order_id, "uship_id": uship_id}).fetchone()

            detail_tax = 0
            detail_ship = 0
            gifttotal = 0
            if shipping_result:
                detail_tax = float(shipping_result[1])
                detail_ship = float(shipping_result[2])
                gifttotal = float(shipping_result[3])

            shipto_detail = ShipToAddress(
                uship_id=uship_id,
                ship_name=shipto[1],
                address1=shipto[2],
                address2=shipto[3],
                city=shipto[4],
                state=shipto[5],
                zip=shipto[6],
                country=shipto[7],
                message=shipto[8],
                subtotal=subtotal,
                detail_tax=detail_tax,
                detail_ship=detail_ship,
                gifttotal=gifttotal,
                products=items,
            )
            order_details.append(shipto_detail)

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
            invalid=result[21],
            incomplete=result[22],
            tracking=result[23],
            comments=result[24],
            subtotal=float(result[25]) if result[25] else 0,
            discount=float(result[26]) if result[26] else 0,
            discount_type=result[27],
            gifttotal=float(result[28]) if result[28] else 0,
            total_fees=float(result[29]) if result[29] else 0,
            active=result[30],
            cust_1=result[31],
            cust_2=result[32],
            cust_3=result[33],
            order_details=order_details,
            items=items_list,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching order detail: {str(e)}",
        )
    finally:
        if store_db:
            store_db.close()


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

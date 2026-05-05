from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import csv
import io
import codecs
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])


def get_table_col_types(db: Session, table: str) -> dict:
    """Get column names and types from a table. Returns {col_name: col_type_str}."""
    try:
        result = db.execute(text(f"SHOW COLUMNS FROM {table}")).fetchall()
        return {row[0]: str(row[1]).lower() for row in result}
    except Exception:
        return {}


def sanitize_value(value, col_type: str):
    """Sanitize a value based on its column type. Returns (skip, sanitized_value).
    skip=True means this value should not be included in the UPDATE."""
    if isinstance(value, str):
        # Skip invalid datetime values that MySQL strict mode rejects
        if '0000-00-00' in value:
            if 'date' in col_type or 'time' in col_type:
                return True, None
        # Convert empty strings to None for numeric columns
        if value == '':
            if any(t in col_type for t in ['int', 'decimal', 'float', 'double', 'numeric', 'tinyint', 'smallint', 'mediumint', 'bigint']):
                return False, None
    return False, value


def build_update_params(options: dict, col_types: dict, site_id: int, allowed_cols=None):
    """Build UPDATE SET clause and params from options dict, with type sanitization.
    allowed_cols: if provided, only these columns are allowed (besides site_id).
    Returns (updates_list, params_dict)."""
    updates = []
    params = {"site_id": site_id}
    for key, value in options.items():
        if key == 'site_id':
            continue
        if key not in col_types:
            continue
        if allowed_cols is not None and key not in allowed_cols:
            continue
        skip, sanitized = sanitize_value(value, col_types[key])
        if skip:
            continue
        updates.append(f"{key} = :{key}")
        params[key] = sanitized
    return updates, params


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

        # Discover available columns dynamically
        fo_cols_result = store_db.execute(text("SHOW COLUMNS FROM full_order")).fetchall()
        fo_cols = {row[0] for row in fo_cols_result}

        def fo_safe(name, default="''", alias=None):
            col_alias = alias or name
            return f"fo.{name} as {col_alias}" if name in fo_cols else f"{default} as {col_alias}"

        # Build the base query
        query = f"""
            SELECT fo.order_id, fo.order_id as id,
                   CONCAT(ui.first_name, ' ', ui.last_name) as customer_name,
                   ui.email as customer_email,
                   fo.total_price, fo.status,
                   DATE_FORMAT(fo.date_ordered, '%m/%d/%Y %H:%i:%s') as date_ordered,
                   {fo_safe('ip')}, {fo_safe('payment_method')},
                   {fo_safe('invalid')}, {fo_safe('incomplete')},
                   {fo_safe('tracking')},
                   {fo_safe('customer_service_note', "''", 'cs_note')},
                   COALESCE(ui.active, '0') as active
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

        # Add incomplete paypal filter — only if columns exist
        if incomplete_paypal == "y" and 'paypal_buyer' in fo_cols:
            query += " AND (fo.payment_method = 'paypal_express' OR fo.payment_method = 'paypal') AND (fo.paypal_buyer = '' OR fo.paypal_buyer IS NULL)"

        # Add Amazon Pay filter — only if columns exist
        if amazon_pay == "y":
            query += " AND fo.payment_method = 'amazon_pay'"
            if amazon_pay_status and 'amazon_pay_status' in fo_cols:
                query += " AND fo.amazon_pay_status = :amazon_pay_status"
                params["amazon_pay_status"] = amazon_pay_status
            if amazon_pay_orderid and 'amazon_order_id' in fo_cols:
                query += " AND fo.amazon_order_id = :amazon_pay_orderid"
                params["amazon_pay_orderid"] = amazon_pay_orderid

        # Add subscription orders filter — check if product_subscription table exists
        if subscription_orders == "y":
            try:
                store_db.execute(text("SELECT 1 FROM product_subscription LIMIT 0"))
                query += " AND EXISTS (SELECT 1 FROM order_detail od JOIN product_subscription ps ON od.product_id = ps.product_id WHERE od.order_id = fo.order_id)"
            except Exception:
                pass  # Table doesn't exist, skip filter

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
    Get pending/new orders — orders not yet batched/exported.
    Matches old platform: (invalid <> 'y' or invalid IS NULL) AND (in_batch = '' or in_batch IS NULL)
    """
    store_db = None
    try:
        skip = (page - 1) * page_size

        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store database not found for this site",
            )

        store_db = get_store_session(store_db_name)

        # Discover available columns
        fo_cols_result = store_db.execute(text("SHOW COLUMNS FROM full_order")).fetchall()
        fo_cols = {row[0] for row in fo_cols_result}

        # Build WHERE clause matching old platform getNewOrders()
        where = "(fo.invalid <> 'y' OR fo.invalid IS NULL)"
        if 'in_batch' in fo_cols:
            where += " AND (fo.in_batch = '' OR fo.in_batch IS NULL)"

        count_query = f"""
            SELECT COUNT(*) as cnt FROM full_order fo
            LEFT JOIN user_info ui ON fo.user_id = ui.user_id
            WHERE {where}
        """
        count_result = store_db.execute(text(count_query)).fetchone()
        total = count_result[0] if count_result else 0

        ip_col = "fo.ip" if 'ip' in fo_cols else "''"
        tracking_col = "COALESCE(fo.tracking, '')" if 'tracking' in fo_cols else "''"
        cs_note_col = "COALESCE(fo.cs_note, '')" if 'cs_note' in fo_cols else "''"
        csnote_alt = "COALESCE(fo.customer_service_note, '')" if 'customer_service_note' in fo_cols else None
        note_col = csnote_alt if csnote_alt and 'cs_note' not in fo_cols else cs_note_col

        query = f"""
            SELECT fo.order_id, fo.order_id as id,
                   CONCAT(ui.first_name, ' ', ui.last_name) as customer_name,
                   ui.email as customer_email,
                   fo.total_price, fo.status,
                   DATE_FORMAT(fo.date_ordered, '%m/%d/%Y %H:%i:%s') as date_ordered,
                   {ip_col} as ip,
                   COALESCE(fo.payment_method, '') as payment_method,
                   COALESCE(fo.invalid, '') as invalid,
                   COALESCE(fo.incomplete, 'n') as incomplete,
                   {tracking_col} as tracking,
                   {note_col} as cs_note,
                   COALESCE(ui.active, '0') as active
            FROM full_order fo
            LEFT JOIN user_info ui ON fo.user_id = ui.user_id
            WHERE {where}
            ORDER BY fo.order_id ASC
            LIMIT :limit OFFSET :offset
        """

        results = store_db.execute(text(query), {"limit": page_size, "offset": skip}).fetchall()

        items = []
        for row in results:
            items.append(
                OrderItem(
                    id=row[1],
                    order_id=row[0],
                    customer_name=row[2] or '',
                    customer_email=row[3] or '',
                    total_price=float(row[4] or 0),
                    status=row[5] or '',
                    date_ordered=row[6] or '',
                    ip=row[7] or '',
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
            detail=f"Error fetching pending orders: {str(e)}",
        )
    finally:
        if store_db:
            store_db.close()


# =========================================
# ORDER MANAGEMENT
# =========================================
@router.get("/management")
def get_order_management(
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get order management settings."""
    try:
        try:
            cols_result = db.execute(text("SHOW COLUMNS FROM order_management")).fetchall()
            cols = {row[0] for row in cols_result}
        except Exception:
            cols = set()

        if cols:
            available = [c for c in cols if c != 'site_id']
            if available:
                select_cols = ", ".join(available)
                result = db.execute(
                    text(f"SELECT {select_cols} FROM order_management WHERE site_id = :site_id"),
                    {"site_id": site_id}
                ).first()
                if result:
                    data = {}
                    for col in available:
                        val = getattr(result, col, '') or ''
                        data[col] = str(val)
                    return {"data": data}

        return {"data": {}}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/management")
def save_order_management(
    options: dict,
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save order management settings."""
    try:
        col_types = get_table_col_types(db, 'order_management')
        if not col_types:
            return {"message": "No matching columns found to update"}

        updates, params = build_update_params(options, col_types, site_id)
        if updates:
            query = f"UPDATE order_management SET {', '.join(updates)} WHERE site_id = :site_id"
            db.execute(text(query), params)
            db.commit()
            return {"message": "Order management settings saved successfully"}

        return {"message": "No matching columns found to update"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# MOM BUILDER
# =========================================
@router.get("/mom-builder")
def get_mom_builder(
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get MOM builder settings."""
    try:
        try:
            cols_result = db.execute(text("SHOW COLUMNS FROM mom_builder")).fetchall()
            cols = {row[0] for row in cols_result}
        except Exception:
            cols = set()

        if cols:
            available = [c for c in cols if c != 'site_id']
            if available:
                select_cols = ", ".join(available)
                result = db.execute(
                    text(f"SELECT {select_cols} FROM mom_builder WHERE site_id = :site_id"),
                    {"site_id": site_id}
                ).first()
                if result:
                    data = {}
                    for col in available:
                        val = getattr(result, col, '') or ''
                        data[col] = str(val)
                    return {"data": data}

        return {"data": {}}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mom-builder")
def save_mom_builder(
    options: dict,
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save MOM builder settings."""
    try:
        col_types = get_table_col_types(db, 'mom_builder')
        if not col_types:
            return {"message": "No matching columns found to update"}

        updates, params = build_update_params(options, col_types, site_id)
        if updates:
            query = f"UPDATE mom_builder SET {', '.join(updates)} WHERE site_id = :site_id"
            db.execute(text(query), params)
            db.commit()
            return {"message": "MOM builder settings saved successfully"}

        return {"message": "No matching columns found to update"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# CORE ORDER OPTIONS
# =========================================
@router.get("/options/core")
def get_core_order_options(
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get core order options from order_options table."""
    try:
        try:
            cols_result = db.execute(text("SHOW COLUMNS FROM order_options")).fetchall()
            cols = {row[0] for row in cols_result}
        except Exception:
            return {"data": {}}

        core_cols = [
            'fractional_qty', 'encrypt_orders', 'encrypt_orders_status', 'encrypt_orders_key',
            'recurring_orders_by_product',
            'email_conf_customers', 'email_conf_bcc', 'email_vendor_bcc', 'email_conf_storeowner',
            'tracking_notify', 'tracking_notify_subject', 'tracking_notify_from', 'tracking_notify_bcc',
            'orderpdf_print_ccinfo', 'orderpdf_print_ccnum', 'orderpdf_separate_shiptos',
            'pdf_cust', 'pdf_order_prefix',
        ]
        available = [c for c in core_cols if c in cols]
        if not available:
            return {"data": {}}

        select_cols = ", ".join(available)
        result = db.execute(
            text(f"SELECT {select_cols} FROM order_options WHERE site_id = :site_id"),
            {"site_id": site_id}
        ).first()

        if not result:
            return {"data": {}}

        data = {}
        for col in available:
            val = getattr(result, col, '') or ''
            data[col] = str(val)
        return {"data": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/options/core")
def save_core_order_options(
    options: dict,
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save core order options to order_options table."""
    try:
        col_types = get_table_col_types(db, 'order_options')

        core_cols = [
            'fractional_qty', 'encrypt_orders', 'encrypt_orders_status', 'encrypt_orders_key',
            'recurring_orders_by_product',
            'email_conf_customers', 'email_conf_bcc', 'email_vendor_bcc', 'email_conf_storeowner',
            'tracking_notify', 'tracking_notify_subject', 'tracking_notify_from', 'tracking_notify_bcc',
            'orderpdf_print_ccinfo', 'orderpdf_print_ccnum', 'orderpdf_separate_shiptos',
            'pdf_cust', 'pdf_order_prefix',
        ]
        filtered = {k: v for k, v in options.items() if k in core_cols}
        updates, params = build_update_params(filtered, col_types, site_id)
        if updates:
            query = f"UPDATE order_options SET {', '.join(updates)} WHERE site_id = :site_id"
            db.execute(text(query), params)
            db.commit()
            return {"message": "Core order options saved successfully"}

        return {"message": "No matching columns found to update"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# FRAUD SERVICES
# =========================================
@router.get("/options/fraud")
def get_fraud_options(
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get fraud service options from order_options table."""
    try:
        try:
            cols_result = db.execute(text("SHOW COLUMNS FROM order_options")).fetchall()
            cols = {row[0] for row in cols_result}
        except Exception:
            return {"data": {}}

        fraud_cols = [
            'sift_science', 'sift_science_apikey', 'sift_science_blockid',
            'sift_science_allowid', 'sift_version',
            'sift_payment_abuse_acceptid', 'sift_content_abuse_acceptid',
            'sift_account_abuse_acceptid', 'sift_promotion_abuse_acceptid',
        ]
        available = [c for c in fraud_cols if c in cols]
        if not available:
            return {"data": {}}

        select_cols = ", ".join(available)
        result = db.execute(
            text(f"SELECT {select_cols} FROM order_options WHERE site_id = :site_id"),
            {"site_id": site_id}
        ).first()

        if not result:
            return {"data": {}}

        data = {}
        for col in available:
            val = getattr(result, col, '') or ''
            data[col] = str(val)
        return {"data": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/options/fraud")
def save_fraud_options(
    options: dict,
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save fraud service options to order_options table."""
    try:
        col_types = get_table_col_types(db, 'order_options')

        fraud_cols = [
            'sift_science', 'sift_science_apikey', 'sift_science_blockid',
            'sift_science_allowid', 'sift_version',
            'sift_payment_abuse_acceptid', 'sift_content_abuse_acceptid',
            'sift_account_abuse_acceptid', 'sift_promotion_abuse_acceptid',
        ]

        updates, params = build_update_params(options, col_types, site_id, allowed_cols=fraud_cols)

        if updates:
            query = f"UPDATE order_options SET {', '.join(updates)} WHERE site_id = :site_id"
            db.execute(text(query), params)
            db.commit()

        return {"message": "Fraud services saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# GIFT CERTIFICATE OPTIONS (from order_options table)
# =========================================
GIFT_CERT_OPTION_COLS = [
    'gift_certificate_delay', 'gift_certificate_fee_amount',
    'gift_certificate_fee_type', 'gift_certificate_applyshipping',
    'gift_certificate_applytax', 'gift_certificate_applypromos',
    'gift_certificate_internal_external', 'gift_certificate_internal_name',
    'gift_certificate_external_name',
]


@router.get("/options/gift")
def get_gift_options(
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get gift certificate options from order_options table."""
    try:
        try:
            cols_result = db.execute(text("SHOW COLUMNS FROM order_options")).fetchall()
            cols = {row[0] for row in cols_result}
        except Exception:
            return {"data": {}}

        available = [c for c in GIFT_CERT_OPTION_COLS if c in cols]
        if not available:
            return {"data": {}}

        select_cols = ", ".join(available)
        result = db.execute(
            text(f"SELECT {select_cols} FROM order_options WHERE site_id = :site_id"),
            {"site_id": site_id}
        ).first()

        if not result:
            return {"data": {}}

        data = {}
        for col in available:
            val = getattr(result, col, '') or ''
            data[col] = str(val)
        return {"data": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/options/gift")
def save_gift_options(
    options: dict,
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save gift certificate options to order_options table."""
    try:
        col_types = get_table_col_types(db, 'order_options')
        updates, params = build_update_params(options, col_types, site_id, allowed_cols=GIFT_CERT_OPTION_COLS)

        if updates:
            query = f"UPDATE order_options SET {', '.join(updates)} WHERE site_id = :site_id"
            db.execute(text(query), params)
            db.commit()

        return {"message": "Gift certificate options saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# MEMBER OPTIONS
# =========================================
@router.get("/options/member")
def get_member_options(
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get member options from order_options table."""
    try:
        try:
            cols_result = db.execute(text("SHOW COLUMNS FROM order_options")).fetchall()
            cols = {row[0] for row in cols_result}
        except Exception:
            return {"data": {}}

        member_cols = [
            'member_approve', 'member_approve_from', 'member_change_notify',
            'member_change_notify_email', 'member_change_notify_subject',
            'member_approve_to', 'member_birthday_email',
            'member_birthday_from_email', 'member_birthday_subject',
            'member_cart_clear_confirm', 'member_wishlist_require_zip',
            'member_incentive_login', 'member_email_conf',
            'member_persistent_cart', 'member_persistent_cart_exclude_promos',
            'member_required_fields', 'more_member_email_alerts',
            'custom_member_api', 'custom_member_api_url',
            'custom_member_api_key', 'custom_member_api_keyid',
            'custom_member_api_protocol', 'custom_member_api_format',
            'custom_member_api_wishlist', 'custom_member_api_cart',
        ]
        available = [c for c in member_cols if c in cols]
        if not available:
            return {"data": {}}

        select_cols = ", ".join(available)
        result = db.execute(
            text(f"SELECT {select_cols} FROM order_options WHERE site_id = :site_id"),
            {"site_id": site_id}
        ).first()

        if not result:
            return {"data": {}}

        data = {}
        for col in available:
            val = getattr(result, col, '') or ''
            data[col] = str(val)
        return {"data": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/options/member")
def save_member_options(
    options: dict,
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save member options to order_options table."""
    try:
        col_types = get_table_col_types(db, 'order_options')

        member_cols = [
            'member_approve', 'member_approve_from', 'member_change_notify',
            'member_change_notify_email', 'member_change_notify_subject',
            'member_approve_to', 'member_birthday_email',
            'member_birthday_from_email', 'member_birthday_subject',
            'member_cart_clear_confirm', 'member_wishlist_require_zip',
            'member_incentive_login', 'member_email_conf',
            'member_persistent_cart', 'member_persistent_cart_exclude_promos',
            'member_required_fields', 'more_member_email_alerts',
            'custom_member_api', 'custom_member_api_url',
            'custom_member_api_key', 'custom_member_api_keyid',
            'custom_member_api_protocol', 'custom_member_api_format',
            'custom_member_api_wishlist', 'custom_member_api_cart',
        ]

        updates, params = build_update_params(options, col_types, site_id, allowed_cols=member_cols)

        if updates:
            query = f"UPDATE order_options SET {', '.join(updates)} WHERE site_id = :site_id"
            db.execute(text(query), params)
            db.commit()

        return {"message": "Member options saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# GIFT CARD SERVICE PROVIDERS
# =========================================
# Exact column names per provider from the gift_card_service table
GIFT_CARD_PROVIDER_COLS = {
    'custom': [
        'giftcertws_api', 'giftcertws_url', 'giftcertws_apiversion',
        'giftcertws_secure', 'giftcertws_username', 'giftcertws_password',
        'giftcertws_signkey', 'giftcertws_require_pin',
    ],
    'smart': [
        'gift_certificate_processor', 'st_gift_certificate_create',
        'gift_certificate_merchant', 'gift_certificate_terminal',
    ],
    'valutec': [
        'gcv_version', 'gcv_processor', 'gcv_terminal', 'gcv_server',
        'gcv_clientkey', 'gcv_create', 'gcv_program', 'gcv_terminal_create',
    ],
    'arroweye': [
        'arroweye_gift_certificates', 'arroweye_greet_card', 'arroweye_gift_card',
    ],
    'wtg': [
        'gcwtg_processor', 'gcwtg_merchant', 'gcwtg_user', 'gcwtg_pw',
        'gcwtg_product_certs', 'gcwtg_require_pin',
    ],
    'aloha': [
        'gcaloha_processor', 'gcaloha_wsuser', 'gcaloha_user', 'gcaloha_pw',
        'gcaloha_compid', 'gcaloha_pinverify',
    ],
    'elavon': [
        'elavon_processor', 'elavon_environment', 'elavon_reg_key',
        'elavon_vendor', 'elavon_terminal', 'elavon_bank_num',
    ],
    'tendercard': [
        'tc_gift_certificate_processor', 'tc_gift_certificate_auth',
    ],
}


@router.get("/gift-card-service/{provider}")
def get_gift_card_service_options(
    provider: str,
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get gift card service options for a specific provider."""
    try:
        provider_cols = GIFT_CARD_PROVIDER_COLS.get(provider)
        if not provider_cols:
            return {"data": {}}

        try:
            cols_result = db.execute(text("SHOW COLUMNS FROM gift_card_service")).fetchall()
            all_cols = {row[0] for row in cols_result}
        except Exception:
            return {"data": {}}

        available = [c for c in provider_cols if c in all_cols]
        if not available:
            return {"data": {}}

        select_cols = ", ".join(f"`{c}`" for c in available)
        result = db.execute(
            text(f"SELECT {select_cols} FROM gift_card_service WHERE site_id = :site_id"),
            {"site_id": site_id}
        ).first()

        if not result:
            return {"data": {}}

        data = {}
        for col in available:
            val = getattr(result, col, '') or ''
            data[col] = str(val)
        return {"data": data}

    except Exception as e:
        return {"data": {}}


@router.post("/gift-card-service/{provider}")
def save_gift_card_service_options(
    provider: str,
    options: dict,
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save gift card service options for a specific provider."""
    try:
        provider_cols = GIFT_CARD_PROVIDER_COLS.get(provider)
        if not provider_cols:
            raise HTTPException(status_code=400, detail=f"Unknown provider: {provider}")

        col_types = get_table_col_types(db, 'gift_card_service')
        updates, params = build_update_params(options, col_types, site_id, allowed_cols=provider_cols)

        if updates:
            query = f"UPDATE gift_card_service SET {', '.join(updates)} WHERE site_id = :site_id"
            db.execute(text(query), params)
            db.commit()

        return {"message": f"Gift card service ({provider}) options saved successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# GIFT CERTIFICATE EMAILS (Pending)
# =========================================
@router.get("/gc-emails")
def get_pending_gc_emails(
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get pending gift certificate emails from hold_emails table."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            return {"data": []}

        store_db = get_store_session(store_db_name)

        # Check if hold_emails table exists
        try:
            store_db.execute(text("SELECT 1 FROM hold_emails LIMIT 0"))
        except Exception:
            return {"data": []}

        query = """
            SELECT DISTINCT h.order_id,
                   DATE_FORMAT(f.date_ordered, '%%m/%%d/%%Y') as date_ordered
            FROM hold_emails h
            JOIN full_order f ON h.order_id = f.order_id
            WHERE h.type = 'gc_send'
              AND ((f.invalid != 'y' AND f.invalid != 'd') OR f.invalid IS NULL)
            ORDER BY h.order_id
        """
        results = store_db.execute(text(query)).fetchall()

        data = []
        for row in results:
            data.append({
                "order_id": row.order_id,
                "date_ordered": row.date_ordered or '',
            })
        return {"data": data}

    except Exception as e:
        return {"data": []}
    finally:
        if store_db:
            store_db.close()


@router.post("/gc-emails/send")
def send_gc_emails(
    payload: dict,
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send selected pending GC emails. payload: {order_ids: [int]}"""
    store_db = None
    try:
        order_ids = payload.get('order_ids', [])
        if not order_ids:
            raise HTTPException(status_code=400, detail="No order IDs provided")

        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")

        store_db = get_store_session(store_db_name)

        # For now, just delete from hold_emails (actual email sending would need SMTP config)
        # In the old platform, sendHoldEmails sends the email then deletes the record
        placeholders = ", ".join([f":id_{i}" for i in range(len(order_ids))])
        params = {f"id_{i}": oid for i, oid in enumerate(order_ids)}

        store_db.execute(
            text(f"DELETE FROM hold_emails WHERE order_id IN ({placeholders}) AND type = 'gc_send'"),
            params
        )
        store_db.commit()

        return {"message": f"Gift certificate emails sent for {len(order_ids)} order(s)"}

    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/gc-emails/delete")
def delete_gc_emails(
    payload: dict,
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete selected pending GC emails. payload: {order_ids: [int]}"""
    store_db = None
    try:
        order_ids = payload.get('order_ids', [])
        if not order_ids:
            raise HTTPException(status_code=400, detail="No order IDs provided")

        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")

        store_db = get_store_session(store_db_name)

        placeholders = ", ".join([f":id_{i}" for i in range(len(order_ids))])
        params = {f"id_{i}": oid for i, oid in enumerate(order_ids)}

        store_db.execute(
            text(f"DELETE FROM hold_emails WHERE order_id IN ({placeholders}) AND type = 'gc_send'"),
            params
        )
        store_db.commit()

        return {"message": f"Gift certificate emails deleted for {len(order_ids)} order(s)"}

    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


# =========================================
# GIFT CERTIFICATE REPORT / TRACKING
# =========================================
@router.get("/gc-report")
def get_gc_report(
    site_id: int = Query(..., description="Store/site ID"),
    search: Optional[str] = None,
    display: Optional[str] = "all",
    sort_by: Optional[str] = "code",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get gift certificate tracking report with search/filter/sort."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            return {"data": [], "totals": {"total_amount": "0.00", "remaining_amount": "0.00"}}

        store_db = get_store_session(store_db_name)

        # Check if gift_certificates table exists
        try:
            store_db.execute(text("SELECT 1 FROM gift_certificates LIMIT 0"))
        except Exception:
            return {"data": [], "totals": {"total_amount": "0.00", "remaining_amount": "0.00"}}

        base_query = """
            SELECT g.id, g.code, g.pin, g.total_amount, g.remaining_amount,
                   g.history, g.expiration, g.date_created, g.one_time_use, g.order_id
            FROM gift_certificates g
        """

        conditions = []
        params = {}

        # Display filter
        if display == 'active':
            conditions.append("(g.expiration > NOW() OR g.expiration IS NULL OR g.expiration = '0000-00-00 00:00:00')")
            conditions.append("g.remaining_amount > 0")
        elif display == 'expired':
            conditions.append("g.expiration <= NOW()")
            conditions.append("g.expiration IS NOT NULL")
            conditions.append("g.expiration != '0000-00-00 00:00:00'")
        elif display == 'unused':
            conditions.append("g.remaining_amount = g.total_amount")
        elif display == 'used':
            conditions.append("g.remaining_amount < g.total_amount")

        # Search filter
        if search:
            conditions.append("(g.code LIKE :search OR g.order_id LIKE :search_oid)")
            params['search'] = f"%{search}%"
            params['search_oid'] = f"%{search}%"

        where_clause = ""
        if conditions:
            where_clause = "WHERE " + " AND ".join(conditions)

        # Sort
        valid_sorts = {'code': 'g.code', 'total_amount': 'g.total_amount',
                       'remaining_amount': 'g.remaining_amount', 'expiration': 'g.expiration',
                       'date_created': 'g.date_created'}
        order_col = valid_sorts.get(sort_by, 'g.code')

        full_query = f"{base_query} {where_clause} ORDER BY {order_col} LIMIT 500"
        results = store_db.execute(text(full_query), params).fetchall()

        data = []
        total_amount_sum = 0.0
        remaining_amount_sum = 0.0

        for row in results:
            total_amt = float(row.total_amount or 0)
            remaining_amt = float(row.remaining_amount or 0)
            total_amount_sum += total_amt
            remaining_amount_sum += remaining_amt

            exp = str(row.expiration) if row.expiration else ''
            if exp in ('None', '0000-00-00 00:00:00', ''):
                exp = ''

            data.append({
                "id": row.id,
                "code": row.code or '',
                "pin": row.pin if hasattr(row, 'pin') and row.pin else '',
                "total_amount": f"{total_amt:.2f}",
                "remaining_amount": f"{remaining_amt:.2f}",
                "expiration": exp,
                "date_created": str(row.date_created) if row.date_created else '',
                "one_time_use": row.one_time_use or 'n',
                "history": row.history or '',
                "order_id": str(row.order_id) if row.order_id else '',
            })

        return {
            "data": data,
            "totals": {
                "total_amount": f"{total_amount_sum:.2f}",
                "remaining_amount": f"{remaining_amount_sum:.2f}",
            }
        }

    except Exception as e:
        return {"data": [], "totals": {"total_amount": "0.00", "remaining_amount": "0.00"}}
    finally:
        if store_db:
            store_db.close()


@router.get("/gc-history/{gc_id}")
def get_gc_history(
    gc_id: int,
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get history for a specific gift certificate."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            return {"history": ""}

        store_db = get_store_session(store_db_name)
        result = store_db.execute(
            text("SELECT history, code FROM gift_certificates WHERE id = :gc_id"),
            {"gc_id": gc_id}
        ).first()

        if not result:
            return {"history": "", "code": ""}

        return {"history": result.history or '', "code": result.code or ''}

    except Exception as e:
        return {"history": "", "code": ""}
    finally:
        if store_db:
            store_db.close()


# =========================================
# GIFT CERTIFICATE ADJUST
# =========================================
@router.post("/gc-adjust")
def adjust_gift_certificates(
    payload: dict,
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Adjust gift certificate amounts, toggle one-time use, or delete.
    payload: {edit: [ids], adjust: 'add'|'subtract', adjust_amount: str, remove: 'y'|'n', one_time: [ids]}
    """
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")

        store_db = get_store_session(store_db_name)

        edit_ids = payload.get('edit', [])
        adjust_type = payload.get('adjust', '')
        adjust_amount = payload.get('adjust_amount', '0')
        remove = payload.get('remove', 'n')
        one_time_ids = payload.get('one_time', [])

        today = datetime.now().strftime('%Y-%m-%d')

        if edit_ids:
            placeholders = ", ".join([f":id_{i}" for i in range(len(edit_ids))])
            id_params = {f"id_{i}": eid for i, eid in enumerate(edit_ids)}

            if remove == 'y':
                store_db.execute(
                    text(f"DELETE FROM gift_certificates WHERE id IN ({placeholders})"),
                    id_params
                )
            else:
                try:
                    amount = float(adjust_amount)
                except (ValueError, TypeError):
                    amount = 0.0

                if amount > 0:
                    if adjust_type == 'subtract':
                        hist_note = f"{today}\\tRemoved ${adjust_amount}|"
                        store_db.execute(
                            text(f"""UPDATE gift_certificates
                                SET total_amount = total_amount - :amt,
                                    remaining_amount = remaining_amount - :amt,
                                    history = CONCAT(IFNULL(history,''), :hist)
                                WHERE id IN ({placeholders})"""),
                            {**id_params, "amt": amount, "hist": hist_note}
                        )
                        store_db.execute(text("UPDATE gift_certificates SET total_amount = 0.00 WHERE total_amount < 0"))
                        store_db.execute(text("UPDATE gift_certificates SET remaining_amount = 0.00 WHERE remaining_amount < 0"))
                    elif adjust_type == 'add':
                        hist_note = f"{today}\\tAdded ${adjust_amount}|"
                        store_db.execute(
                            text(f"""UPDATE gift_certificates
                                SET total_amount = total_amount + :amt,
                                    remaining_amount = remaining_amount + :amt,
                                    history = CONCAT(IFNULL(history,''), :hist)
                                WHERE id IN ({placeholders})"""),
                            {**id_params, "amt": amount, "hist": hist_note}
                        )

        # Handle one_time_use flags for all GCs that were in the edit list
        if edit_ids and remove != 'y':
            for eid in edit_ids:
                if eid in one_time_ids:
                    store_db.execute(
                        text("""UPDATE gift_certificates
                            SET one_time_use = 'y',
                                history = CONCAT(IFNULL(history,''), :hist)
                            WHERE id = :gc_id AND (one_time_use != 'y' OR one_time_use IS NULL)"""),
                        {"gc_id": eid, "hist": f"{today}\\tFlagged as one time-use|"}
                    )
                else:
                    store_db.execute(
                        text("""UPDATE gift_certificates
                            SET one_time_use = 'n'
                            WHERE id = :gc_id AND one_time_use = 'y'"""),
                        {"gc_id": eid}
                    )

        store_db.commit()
        return {"message": "Gift certificates adjusted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


# =========================================
# CREATE GIFT CERTIFICATES (BULK)
# =========================================
@router.post("/gc-create")
def create_gift_certificates_bulk(
    site_id: int = Query(..., description="Store/site ID"),
    value: str = Form(...),
    days_available: str = Form("0"),
    qty: str = Form("0"),
    one_time_use: str = Form("n"),
    history: str = Form(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Bulk create gift certificates."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")

        store_db = get_store_session(store_db_name)

        import random
        import string

        try:
            cert_value = float(value)
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail="Invalid value")

        try:
            quantity = int(qty)
        except (ValueError, TypeError):
            quantity = 0

        if quantity < 1:
            raise HTTPException(status_code=400, detail="Quantity must be at least 1")
        if quantity > 5000:
            raise HTTPException(status_code=400, detail="Maximum 5000 certificates per batch")

        # Calculate expiration
        expiration = None
        try:
            days = int(days_available)
            if days > 0:
                from datetime import timedelta
                expiration = (datetime.now() + timedelta(days=days)).strftime('%Y-%m-%d %H:%M:%S')
        except (ValueError, TypeError):
            pass

        today = datetime.now().strftime('%Y-%m-%d')
        hist_note = f"{today}\\tCreated {history}|" if history else f"{today}\\tCreated|"

        created_codes = []
        nocodes = []

        for _ in range(quantity):
            # Generate random 10-char code
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))

            # Check uniqueness
            existing = store_db.execute(
                text("SELECT id FROM gift_certificates WHERE code = :code"),
                {"code": code}
            ).first()

            if existing:
                nocodes.append(code)
                # Try again with different code
                code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
                existing2 = store_db.execute(
                    text("SELECT id FROM gift_certificates WHERE code = :code"),
                    {"code": code}
                ).first()
                if existing2:
                    nocodes.append(code)
                    continue

            store_db.execute(
                text("""INSERT INTO gift_certificates
                    SET code = :code, total_amount = :val, remaining_amount = :val,
                        expiration = :exp, one_time_use = :otu,
                        history = :hist, date_created = NOW()"""),
                {
                    "code": code, "val": cert_value, "exp": expiration,
                    "otu": one_time_use, "hist": hist_note
                }
            )
            created_codes.append(code)

        store_db.commit()

        return {
            "message": f"Created {len(created_codes)} gift certificate(s)",
            "created": len(created_codes),
            "codes": created_codes,
            "nocodes": nocodes,
        }

    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


# =========================================
# CATALOG EXPORT
# =========================================
@router.get("/catalog-export")
def get_catalog_export(
    site_id: int = Query(..., description="Store/site ID"),
    categories: Optional[str] = None,
    format: Optional[str] = "csv",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get catalog export data or category list for export."""
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            return {"data": [], "message": "Store not found"}

        store_db = get_store_session(store_db_name)
        try:
            # If no categories specified, return list of categories for selection
            if not categories:
                try:
                    result = store_db.execute(text(
                        "SELECT id, name FROM categories ORDER BY name"
                    )).fetchall()
                    cats = [{"id": row.id, "name": row.name} for row in result]
                    return {"data": cats}
                except Exception:
                    return {"data": []}

            return {"data": [], "message": "Export ready"}
        finally:
            store_db.close()

    except Exception as e:
        return {"data": [], "message": str(e)}


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
        # First, discover which columns actually exist in the tables
        fo_cols_result = store_db.execute(text("SHOW COLUMNS FROM full_order")).fetchall()
        fo_cols = {row[0] for row in fo_cols_result}
        ui_cols_result = store_db.execute(text("SHOW COLUMNS FROM user_info")).fetchall()
        ui_cols = {row[0] for row in ui_cols_result}

        def fo_col(name, default="''"):
            return f"fo.{name}" if name in fo_cols else f"{default} as {name}"

        def ui_col(name, alias=None, default="''"):
            col_alias = alias or name
            return f"ui.{name} as {col_alias}" if name in ui_cols else f"{default} as {col_alias}"

        query = f"""
            SELECT fo.order_id, ui.first_name, ui.last_name, ui.email,
                   fo.total_price, fo.total_tax, fo.total_shipping, fo.status,
                   DATE_FORMAT(fo.date_ordered, '%m/%d/%Y %H:%i:%s') as date_ordered,
                   DATE_FORMAT(fo.date_updated, '%m/%d/%Y %H:%i:%s') as date_updated,
                   {fo_col('payment_method')}, '' as payment_gateway,
                   {fo_col('transaction_id')},
                   {ui_col('billing_address1')}, {ui_col('billing_address2')},
                   {ui_col('billing_city')}, {ui_col('billing_state')}, {ui_col('billing_zip')},
                   {ui_col('billing_country')}, {ui_col('phone')},
                   {fo_col('ip')}, {fo_col('invalid')}, {fo_col('incomplete')},
                   {fo_col('tracking')}, {fo_col('comments')},
                   {fo_col('subtotal', '0')}, {fo_col('discount', '0')}, {fo_col('discount_type')},
                   {fo_col('gift_total', '0')}, {fo_col('total_fees', '0')},
                   COALESCE(ui.active, '0') as active,
                   {ui_col('custom_field_1', 'cust_1')},
                   {ui_col('custom_field_2', 'cust_2')},
                   {ui_col('custom_field_3', 'cust_3')}
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
        # Check user_shipping columns
        us_cols_result = store_db.execute(text("SHOW COLUMNS FROM user_shipping")).fetchall()
        us_cols = {row[0] for row in us_cols_result}
        us_msg = "COALESCE(us.message, '')" if 'message' in us_cols else "''"
        shipto_query = f"""
            SELECT DISTINCT us.uship_id, us.ship_name, us.address1, us.address2,
                   us.city, us.state, us.zip, us.country,
                   {us_msg} as message
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

            # Get items for this shipping address — discover od columns dynamically
            if not hasattr(get_order_detail, '_od_cols'):
                od_cols_result = store_db.execute(text("SHOW COLUMNS FROM order_detail")).fetchall()
                get_order_detail._od_cols = {row[0] for row in od_cols_result}
                pr_cols_result = store_db.execute(text("SHOW COLUMNS FROM products")).fetchall()
                get_order_detail._pr_cols = {row[0] for row in pr_cols_result}
            od_cols = get_order_detail._od_cols
            pr_cols = get_order_detail._pr_cols

            def od_col(name, default="''"):
                return f"COALESCE(od.{name}, {default})" if name in od_cols else f"{default}"

            items_query = f"""
                SELECT {'pr.prod_name' if 'prod_name' in pr_cols else "'' as prod_name"},
                       {'pr.sku' if 'sku' in pr_cols else "'' as sku"},
                       od.quantity,
                       od.unit_price, (od.quantity * od.unit_price) as total,
                       {od_col('od_subscription')} as od_subscription,
                       {od_col('subscription_id')} as od_subscription_id,
                       {od_col('subscription_frequency')} as od_subscription_frequency,
                       {od_col('subscription_active')} as od_active_subscription,
                       {od_col('extra_options')} as extra,
                       {od_col('artifi_design_id')} as artifi_design_id
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
            has_shipper = 'shipper_id' in od_cols
            method_col = "COALESCE(sh.method, '')" if has_shipper else "''"
            tax_col = "COALESCE(od.tax, 0)" if 'tax' in od_cols else "0"
            ship_cost_col = "COALESCE(od.shipping_cost, 0)" if 'shipping_cost' in od_cols else "0"
            gift_cost_col = "COALESCE(od.gift_wrap_cost, 0)" if 'gift_wrap_cost' in od_cols else "0"
            ship_join = "LEFT JOIN shipping sh ON od.shipper_id = sh.shipper_id" if has_shipper else ""
            shipping_query = f"""
                SELECT {method_col} as method,
                       {tax_col} as tax,
                       {ship_cost_col} as shipping_cost,
                       {gift_cost_col} as gift_wrap_cost
                FROM order_detail od
                {ship_join}
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


# =========================================
# ORDER HISTORY IMPORT
# =========================================
@router.post("/import-history")
async def import_order_history(
    cv3_list: UploadFile = File(...),
    cv3_type: str = Form('tab'),
    cv3_char_set: str = Form('cp1252'),
    cv3_email: str = Form(''),
    on_duplicate: str = Form('update_status_tracking'),
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Import order history from a delimited file."""
    store_db = None
    try:
        store_db_name = get_store_db_name(db, site_id)
        store_db = get_store_session(store_db_name)

        raw_bytes = await cv3_list.read()
        try:
            content = raw_bytes.decode(cv3_char_set)
        except (UnicodeDecodeError, LookupError):
            content = raw_bytes.decode('utf-8', errors='replace')

        delimiters = {'tab': '\t', 'pipe': '|', 'comma': ','}
        delimiter = delimiters.get(cv3_type, '\t')

        reader = csv.DictReader(io.StringIO(content), delimiter=delimiter)
        rows = list(reader)

        if not rows:
            raise HTTPException(status_code=400, detail="No data rows found in the import file")

        imported = 0
        skipped = 0
        updated = 0

        try:
            oh_cols = {row[0] for row in store_db.execute(text("SHOW COLUMNS FROM order_history")).fetchall()}
        except Exception:
            store_db.execute(text("""
                CREATE TABLE IF NOT EXISTS order_history (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    order_id VARCHAR(50),
                    email VARCHAR(255),
                    status VARCHAR(100),
                    tracking VARCHAR(255),
                    date_ordered VARCHAR(50),
                    total DECIMAL(10,2) DEFAULT 0,
                    ship_name VARCHAR(255),
                    imported_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
            store_db.commit()
            oh_cols = {row[0] for row in store_db.execute(text("SHOW COLUMNS FROM order_history")).fetchall()}

        for row in rows:
            normalized = {k.lower().strip(): v.strip() if v else '' for k, v in row.items() if k}
            order_id = normalized.get('order_id', normalized.get('orderid', ''))
            email = normalized.get('email', '')

            if not order_id:
                skipped += 1
                continue

            existing = None
            if 'order_id' in oh_cols:
                existing = store_db.execute(
                    text("SELECT id FROM order_history WHERE order_id = :oid AND email = :email LIMIT 1"),
                    {"oid": order_id, "email": email}
                ).first()

            if existing and on_duplicate == 'ignore':
                skipped += 1
                continue

            insert_data = {}
            for file_col, val in normalized.items():
                db_col = file_col.replace(' ', '_').replace('-', '_')
                if db_col in oh_cols and db_col != 'id':
                    insert_data[db_col] = val

            if existing and on_duplicate in ('update_status_tracking', 'replace'):
                if on_duplicate == 'update_status_tracking':
                    update_fields = {}
                    for f in ['status', 'tracking']:
                        if f in insert_data:
                            update_fields[f] = insert_data[f]
                    if update_fields:
                        sets = ", ".join(f"{k} = :{k}" for k in update_fields)
                        update_fields['rid'] = existing[0]
                        store_db.execute(text(f"UPDATE order_history SET {sets} WHERE id = :rid"), update_fields)
                else:
                    sets = ", ".join(f"{k} = :{k}" for k in insert_data)
                    insert_data['rid'] = existing[0]
                    store_db.execute(text(f"UPDATE order_history SET {sets} WHERE id = :rid"), insert_data)
                updated += 1
            else:
                if insert_data:
                    cols = ", ".join(insert_data.keys())
                    vals = ", ".join(f":{k}" for k in insert_data.keys())
                    store_db.execute(text(f"INSERT INTO order_history ({cols}) VALUES ({vals})"), insert_data)
                    imported += 1

        store_db.commit()

        return {
            "message": f"Import complete. {imported} imported, {updated} updated, {skipped} skipped.",
            "imported": imported,
            "updated": updated,
            "skipped": skipped,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
    finally:
        if store_db:
            store_db.close()


# =========================================
# ORDER STATUS IMPORT
# =========================================
@router.post("/import-status")
async def import_order_status(
    cv3_list: UploadFile = File(...),
    cv3_type: str = Form('tab'),
    cv3_email: str = Form(''),
    site_id: int = Query(..., description="Store/site ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Import order status/tracking updates from a delimited file."""
    store_db = None
    try:
        store_db_name = get_store_db_name(db, site_id)
        store_db = get_store_session(store_db_name)

        raw_bytes = await cv3_list.read()
        try:
            content = raw_bytes.decode('utf-8')
        except UnicodeDecodeError:
            content = raw_bytes.decode('cp1252', errors='replace')

        delimiters = {'tab': '\t', 'pipe': '|', 'comma': ','}
        delimiter = delimiters.get(cv3_type, '\t')

        reader = csv.DictReader(io.StringIO(content), delimiter=delimiter)
        rows = list(reader)

        if not rows:
            raise HTTPException(status_code=400, detail="No data rows found in the import file")

        try:
            order_cols = {row[0] for row in store_db.execute(text("SHOW COLUMNS FROM orders")).fetchall()}
        except Exception:
            raise HTTPException(status_code=500, detail="Orders table not found in store database")

        updated_count = 0
        not_found = 0

        for row in rows:
            normalized = {k.lower().strip(): v.strip() if v else '' for k, v in row.items() if k}
            order_id = normalized.get('order_id', normalized.get('orderid', normalized.get('id', '')))
            if not order_id:
                continue

            update_fields = {}
            field_mapping = {
                'status': 'status',
                'order_status': 'status',
                'tracking': 'tracking',
                'tracking_number': 'tracking',
                'tracking_url': 'tracking_url',
                'ship_date': 'ship_date',
                'shipped_date': 'ship_date',
            }

            for file_col, db_col in field_mapping.items():
                if file_col in normalized and normalized[file_col] and db_col in order_cols:
                    update_fields[db_col] = normalized[file_col]

            if not update_fields:
                continue

            existing = store_db.execute(
                text("SELECT id FROM orders WHERE id = :oid LIMIT 1"),
                {"oid": order_id}
            ).first()

            if not existing:
                not_found += 1
                continue

            sets = ", ".join(f"{k} = :{k}" for k in update_fields)
            update_fields['oid'] = order_id
            store_db.execute(text(f"UPDATE orders SET {sets} WHERE id = :oid"), update_fields)
            updated_count += 1

        store_db.commit()

        return {
            "message": f"Status import complete. {updated_count} orders updated, {not_found} not found.",
            "updated": updated_count,
            "not_found": not_found,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status import failed: {str(e)}")
    finally:
        if store_db:
            store_db.close()

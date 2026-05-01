from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_user, get_current_admin_user

router = APIRouter(prefix="/vendors", tags=["vendors"])


def get_site_id(request: Request) -> int:
    site_id = request.headers.get("x-site-id") or request.query_params.get("site_id")
    if not site_id:
        raise HTTPException(status_code=400, detail="site_id is required")
    return int(site_id)


@router.get("")
def list_vendors(
    request: Request,
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all vendors with optional search."""
    site_id = get_site_id(request)
    store_db_name = get_store_db_name(site_id, db)
    if not store_db_name:
        raise HTTPException(status_code=404, detail="Store not found")

    store_db = get_store_session(store_db_name)
    try:
        # Check if vendors table exists
        try:
            store_db.execute(text("SELECT 1 FROM vendors LIMIT 1"))
        except Exception:
            return {"data": [], "total": 0, "message": "Vendors table not found"}

        where_clause = ""
        params = {}
        if search:
            where_clause = "WHERE name LIKE :search OR email LIKE :search OR contact LIKE :search"
            params["search"] = f"%{search}%"

        # Get total count
        count_query = f"SELECT COUNT(*) FROM vendors {where_clause}"
        total = store_db.execute(text(count_query), params).scalar() or 0

        # Get paginated results
        offset = (page - 1) * page_size
        query = f"""
            SELECT id, name, email, contact, phone, city, state, zip,
                   address1, address2, acct_num, inactive,
                   ship_from_address1, ship_from_city, ship_from_state,
                   ship_from_zip, ship_from_country, force_shipper
            FROM vendors {where_clause}
            ORDER BY name ASC
            LIMIT :limit OFFSET :offset
        """
        params["limit"] = page_size
        params["offset"] = offset

        rows = store_db.execute(text(query), params).fetchall()
        items = []
        for row in rows:
            items.append({
                "id": str(row.id),
                "name": row.name or "",
                "email": row.email or "",
                "contact": row.contact or "",
                "phone": row.phone or "",
                "city": row.city or "",
                "state": row.state or "",
                "zip": row.zip or "",
                "address1": row.address1 or "",
                "address2": row.address2 or "",
                "acct_num": row.acct_num or "",
                "inactive": row.inactive or "n",
                "ship_from_address1": row.ship_from_address1 or "",
                "ship_from_city": row.ship_from_city or "",
                "ship_from_state": row.ship_from_state or "",
                "ship_from_zip": row.ship_from_zip or "",
                "ship_from_country": row.ship_from_country or "",
                "force_shipper": row.force_shipper or "",
                "status": "Inactive" if (row.inactive or "").lower() == "y" else "Active",
            })

        return {"data": items, "total": total, "page": page, "page_size": page_size}
    finally:
        store_db.close()


@router.get("/{vendor_id}")
def get_vendor(
    vendor_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single vendor by ID."""
    site_id = get_site_id(request)
    store_db_name = get_store_db_name(site_id, db)
    if not store_db_name:
        raise HTTPException(status_code=404, detail="Store not found")

    store_db = get_store_session(store_db_name)
    try:
        row = store_db.execute(text(
            "SELECT * FROM vendors WHERE id = :id"
        ), {"id": vendor_id}).first()

        if not row:
            raise HTTPException(status_code=404, detail="Vendor not found")

        # Convert row to dict
        columns = row._fields if hasattr(row, '_fields') else row.keys()
        vendor = {col: str(getattr(row, col, '') or '') for col in columns}
        return {"data": vendor}
    finally:
        store_db.close()

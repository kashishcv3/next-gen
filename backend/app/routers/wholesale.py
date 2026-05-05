from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_admin_user
from typing import Optional, List
from pydantic import BaseModel

router = APIRouter(prefix="/wholesale", tags=["wholesale"])


# ─── WHOLESALE ORDERS (store DB: wholesale_order + wholesaler_info) ──────────

@router.get("/orders")
def get_wholesale_orders(
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get unprocessed wholesale orders (not yet in a batch)."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        rows = store_db.execute(text(
            "SELECT wo.wsorder_id, wo.date_ordered, wo.status, wo.in_batch, wi.email "
            "FROM wholesale_order AS wo, wholesaler_info AS wi "
            "WHERE (wo.invalid <> 'y' OR wo.invalid IS NULL) "
            "AND wo.ws_id = wi.ws_id "
            "AND (wo.in_batch = '' OR wo.in_batch IS NULL) "
            "ORDER BY wo.wsorder_id"
        )).fetchall()

        orders = []
        order_ids = []
        for row in rows:
            orders.append({
                "wsorder_id": row.wsorder_id,
                "date_ordered": str(row.date_ordered) if row.date_ordered else "",
                "email": row.email or "",
            })
            order_ids.append(str(row.wsorder_id))

        return {
            "data": orders,
            "count": len(orders),
            "list": ",".join(order_ids),
        }
    except Exception as e:
        if "doesn't exist" in str(e).lower():
            return {"data": [], "count": 0, "list": ""}
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/orders/batch")
def batch_wholesale_orders(
    site_id: int = Query(...),
    order_list: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Mark orders as batched (set in_batch to 'save' then lock with timestamp)."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        ids = [i.strip() for i in order_list.split(",") if i.strip()]
        if not ids:
            raise HTTPException(status_code=400, detail="No order IDs provided")

        # Mark as 'save' first
        for oid in ids:
            store_db.execute(text(
                "UPDATE wholesale_order SET in_batch='save' WHERE wsorder_id=:id"
            ), {"id": oid})

        # Then lock with timestamp
        rows = store_db.execute(text(
            "SELECT wsorder_id FROM wholesale_order WHERE in_batch='save'"
        )).fetchall()
        for row in rows:
            store_db.execute(text(
                "UPDATE wholesale_order SET in_batch=NOW() WHERE wsorder_id=:id"
            ), {"id": row.wsorder_id})

        store_db.commit()
        return {"message": "Orders batched successfully", "count": len(ids)}
    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/orders/reprint")
def reprint_last_batch(
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get previously saved/batched orders for reprinting."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        rows = store_db.execute(text(
            "SELECT wsorder_id FROM wholesale_order "
            "WHERE in_batch IS NOT NULL AND in_batch <> '' AND in_batch <> 'save' "
            "ORDER BY wsorder_id"
        )).fetchall()

        order_ids = [str(row.wsorder_id) for row in rows]
        return {"list": ",".join(order_ids), "count": len(order_ids)}
    except Exception as e:
        if "doesn't exist" in str(e).lower():
            return {"list": "", "count": 0}
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.delete("/orders/{order_id}")
def delete_wholesale_order(
    order_id: int,
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Mark a wholesale order as invalid (soft delete)."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        store_db.execute(text(
            "UPDATE wholesale_order SET invalid='y' WHERE wsorder_id=:id"
        ), {"id": order_id})
        store_db.commit()
        return {"message": "Order deleted successfully"}
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


# ─── APPROVE WHOLESALERS (store DB: wholesaler_info) ────────────────────────

@router.get("/approve")
def get_new_wholesalers(
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get wholesalers pending approval (new_ws='y')."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        rows = store_db.execute(text(
            "SELECT ws_id, company_name, contact_first_name, contact_last_name, "
            "billing_city, billing_state "
            "FROM wholesaler_info "
            "WHERE new_ws = 'y' AND (removed != 'y' OR removed IS NULL)"
        )).fetchall()

        data = []
        for row in rows:
            data.append({
                "ws_id": row.ws_id,
                "company_name": row.company_name or "",
                "contact_first_name": row.contact_first_name or "",
                "contact_last_name": row.contact_last_name or "",
                "billing_city": row.billing_city or "",
                "billing_state": row.billing_state or "",
            })

        return {"data": data, "count": len(data)}
    except Exception as e:
        if "doesn't exist" in str(e).lower():
            return {"data": [], "count": 0}
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/approve")
def approve_wholesalers(
    site_id: int = Query(...),
    body: dict = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Approve selected wholesalers. Body: { "ws_ids": [1, 2, 3] }"""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        ws_ids = body.get("ws_ids", [])
        if not ws_ids:
            raise HTTPException(status_code=400, detail="No wholesalers selected")

        for ws_id in ws_ids:
            store_db.execute(text(
                "UPDATE wholesaler_info SET new_ws='', active='1' WHERE ws_id=:id"
            ), {"id": ws_id})

        store_db.commit()
        return {"message": f"{len(ws_ids)} wholesaler(s) approved successfully"}
    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.get("/view/{ws_id}")
def get_wholesaler_detail(
    ws_id: int,
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get full wholesaler detail for popup view."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        row = store_db.execute(text(
            "SELECT * FROM wholesaler_info WHERE ws_id=:id"
        ), {"id": ws_id}).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Wholesaler not found")

        cols = row._mapping
        return {"data": {k: (str(v) if v is not None else "") for k, v in cols.items()}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.delete("/wholesaler/{ws_id}")
def delete_wholesaler(
    ws_id: int,
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Soft delete a wholesaler (set removed='y')."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        store_db.execute(text(
            "UPDATE wholesaler_info SET removed='y' WHERE ws_id=:id"
        ), {"id": ws_id})
        store_db.commit()
        return {"message": "Wholesaler deleted successfully"}
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


# ─── SEARCH WHOLESALERS (store DB: wholesaler_info) ─────────────────────────

@router.get("/list")
def get_wholesaler_list(
    site_id: int = Query(...),
    limit_by: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Search/list wholesalers with optional filtering."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        base_query = (
            "SELECT ws_id, company_name, contact_first_name, contact_last_name, "
            "billing_city, billing_state, active, new_ws "
            "FROM wholesaler_info "
            "WHERE (removed != 'y' OR removed IS NULL)"
        )
        params = {}

        if limit_by and search:
            if limit_by == "active":
                base_query += " AND active='1'"
            elif limit_by == "inactive":
                base_query += " AND (active != '1' OR active IS NULL)"
            elif limit_by == "new":
                base_query += " AND new_ws = 'y'"
            else:
                # Search by column name (company_name, email, contact_last_name, billing_state)
                allowed_cols = ["company_name", "email", "contact_last_name", "billing_state"]
                if limit_by in allowed_cols:
                    base_query += f" AND {limit_by} LIKE :search"
                    params["search"] = f"%{search}%"

        base_query += " ORDER BY company_name"

        rows = store_db.execute(text(base_query), params).fetchall()

        data = []
        for row in rows:
            status = "new" if row.new_ws == "y" else ("active" if row.active == "1" else "inactive")
            data.append({
                "ws_id": row.ws_id,
                "company_name": row.company_name or "",
                "contact_first_name": row.contact_first_name or "",
                "contact_last_name": row.contact_last_name or "",
                "billing_city": row.billing_city or "",
                "billing_state": row.billing_state or "",
                "status": status,
            })

        # Search options (static list matching old platform)
        options = {
            "company_name": "Company Name",
            "email": "Email Address",
            "contact_last_name": "Contact Last Name",
            "billing_state": "State",
            "active": "Show Only Active",
            "inactive": "Show Only Inactive",
            "new": "Show Only New Requests",
        }

        return {"data": data, "options": options}
    except Exception as e:
        if "doesn't exist" in str(e).lower():
            return {"data": [], "options": {}}
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


# ─── WHOLESALE SHIPPING (store DB: ws_shipper) ──────────────────────────────

@router.get("/shipping")
def get_ws_shipping_list(
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get wholesale shipping methods list."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        rows = store_db.execute(text(
            "SELECT id, method, code "
            "FROM ws_shipper "
            "WHERE inactive IS NULL OR inactive='' "
            "ORDER BY method"
        )).fetchall()

        data = []
        for row in rows:
            data.append({
                "id": row.id,
                "method": row.method or "",
                "code": row.code or "",
            })

        return {"data": data}
    except Exception as e:
        if "doesn't exist" in str(e).lower():
            return {"data": []}
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.delete("/shipping/{shipper_id}")
def delete_ws_shipper(
    shipper_id: int,
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete a wholesale shipper and its rates."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        # Delete rates first, then shipper
        store_db.execute(text(
            "DELETE FROM ws_shipping WHERE method=:id"
        ), {"id": shipper_id})
        store_db.execute(text(
            "DELETE FROM ws_shipper WHERE id=:id"
        ), {"id": shipper_id})
        store_db.commit()

        return {"message": "Shipper deleted successfully"}
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


# ─── WHOLESALE ORDER HISTORY (store DB) ─────────────────────────────────────

@router.get("/order-history/{ws_id}")
def get_wholesaler_order_history(
    ws_id: int,
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get order history for a specific wholesaler."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        rows = store_db.execute(text(
            "SELECT wsorder_id, date_ordered, status, in_batch "
            "FROM wholesale_order "
            "WHERE ws_id=:ws_id AND (invalid <> 'y' OR invalid IS NULL) "
            "ORDER BY date_ordered DESC"
        ), {"ws_id": ws_id}).fetchall()

        data = []
        for row in rows:
            data.append({
                "wsorder_id": row.wsorder_id,
                "date_ordered": str(row.date_ordered) if row.date_ordered else "",
                "status": row.status or "",
                "in_batch": str(row.in_batch) if row.in_batch else "",
            })

        return {"data": data}
    except Exception as e:
        if "doesn't exist" in str(e).lower():
            return {"data": []}
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()

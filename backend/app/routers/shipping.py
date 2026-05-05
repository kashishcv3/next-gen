from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_admin_user
from datetime import datetime
from app.utils.db_helpers import build_safe_update

router = APIRouter(prefix="/shipping", tags=["shipping"])


def get_site_id(request: Request) -> int:
    """Extract site_id from request headers or query params."""
    site_id = request.headers.get("x-site-id") or request.query_params.get("site_id")
    if not site_id:
        raise HTTPException(status_code=400, detail="site_id is required")
    return int(site_id)


def get_store_db(site_id: int, central_db: Session):
    """Get a store database session for the given site_id."""
    db_name = get_store_db_name(site_id, central_db)
    if not db_name:
        raise HTTPException(status_code=404, detail=f"Store not found for site_id {site_id}")
    return get_store_session(db_name)


# =========================================
# SHIPPING CORE OPTIONS (dashboard DB - shipping_options table)
# =========================================
@router.get("/options")
def get_shipping_options(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get core shipping options from shipping_options table in dashboard DB."""
    site_id = get_site_id(request)
    try:
        # Dynamically detect columns
        cols_result = db.execute(text("SHOW COLUMNS FROM shipping_options")).fetchall()
        all_cols = {row[0] for row in cols_result}

        # Core shipping option columns from old platform
        core_cols = [
            'ship_calc', 'ship_calculator', 'vendor_ship_calc', 'use_ship_on',
            'shipping_type', 'ship_territories', 'ship_apo', 'ship_address_confirm',
            'ship_address_member_copy', 'ship_address_confirm_real',
            'ship_address_confirm_real_key', 'ship_address_confirm_real_key_live',
            'shipworks_enable', 'shipworks_statuscodes', 'origin_address',
        ]
        available = [c for c in core_cols if c in all_cols]
        if not available:
            return {"data": {}}

        select_cols = ", ".join(f'`{c}`' for c in available)
        result = db.execute(
            text(f"SELECT {select_cols} FROM shipping_options WHERE site_id = :site_id"),
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


@router.post("/options")
def save_shipping_options(
    request: Request,
    options: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save core shipping options to shipping_options table."""
    site_id = get_site_id(request)
    try:
        core_cols = [
            'ship_calc', 'ship_calculator', 'vendor_ship_calc', 'use_ship_on',
            'shipping_type', 'ship_territories', 'ship_apo', 'ship_address_confirm',
            'ship_address_member_copy', 'ship_address_confirm_real',
            'ship_address_confirm_real_key', 'ship_address_confirm_real_key_live',
            'shipworks_enable', 'shipworks_statuscodes', 'origin_address',
        ]

        build_safe_update(db, 'shipping_options', options, 'site_id', site_id, allowed_cols=core_cols)

        return {"message": "Shipping options saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# SHIPPING TABLES / METHODS (store DB - shipper table)
# =========================================
@router.get("/tables")
@router.get("/methods")
def get_shipping_methods(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get all shipping methods from shipper table in store DB."""
    site_id = get_site_id(request)
    store_db = None
    try:
        store_db = get_store_db(site_id, db)

        # Detect available columns
        cols_result = store_db.execute(text("SHOW COLUMNS FROM shipper")).fetchall()
        all_cols = {row[0] for row in cols_result}

        # Build select with available columns
        want_cols = ['id', 'method', 'admin_display', 'rate_tool', 'auto_id', 'code',
                     'visible', 'default_method', 'inactive', 'rank', 'type',
                     'accept_po_box', 'dimensional_shipping', 'countries', 'states']
        select_cols = [c for c in want_cols if c in all_cols]
        if not select_cols:
            return {"data": []}

        order_col = 'rank' if 'rank' in all_cols else 'id'
        select_str = ', '.join(f'`{c}`' for c in select_cols)
        result = store_db.execute(text(
            f"SELECT {select_str} FROM shipper ORDER BY `{order_col}` ASC, `id` ASC"
        )).fetchall()

        methods = []
        for row in result:
            m = {}
            for col in select_cols:
                val = getattr(row, col, '')
                m[col] = str(val) if val is not None else ''
            methods.append(m)

        return {"data": methods}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/methods/update-visibility")
def update_shipping_visibility(
    request: Request,
    updates: list,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update visibility and default method for shipping methods in store DB."""
    site_id = get_site_id(request)
    store_db = None
    try:
        store_db = get_store_db(site_id, db)
        for update in updates:
            store_db.execute(text(
                "UPDATE shipper SET visible = :visible, default_method = :default_method WHERE id = :id"
            ), {
                "id": update['id'],
                "visible": update.get('visible', 'n'),
                "default_method": update.get('default_method', 'n'),
            })
        store_db.commit()
        return {"message": "Shipping methods updated successfully"}
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/methods/{method_id}/move-up")
def move_shipping_method_up(
    method_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Move a shipping method up in priority order."""
    site_id = get_site_id(request)
    store_db = None
    try:
        store_db = get_store_db(site_id, db)
        current = store_db.execute(text(
            "SELECT rank FROM shipper WHERE id = :id"
        ), {"id": method_id}).fetchone()

        if not current:
            raise HTTPException(status_code=404, detail="Shipping method not found")

        previous = store_db.execute(text(
            "SELECT id, rank FROM shipper WHERE rank < :rank ORDER BY rank DESC LIMIT 1"
        ), {"rank": current.rank}).fetchone()

        if previous:
            store_db.execute(text("UPDATE shipper SET rank = :new_rank WHERE id = :id"),
                           {"new_rank": previous.rank, "id": method_id})
            store_db.execute(text("UPDATE shipper SET rank = :new_rank WHERE id = :id"),
                           {"new_rank": current.rank, "id": previous.id})

        store_db.commit()
        return {"message": "Shipping method moved up successfully"}
    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.delete("/methods/{method_id}")
def delete_shipping_method(
    method_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete a shipping method from store DB."""
    site_id = get_site_id(request)
    store_db = None
    try:
        store_db = get_store_db(site_id, db)
        store_db.execute(text("DELETE FROM shipper WHERE id = :id"), {"id": method_id})
        store_db.commit()
        return {"message": "Shipping method deleted successfully"}
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


# =========================================
# SHIPPING GROUPS (store DB - shipping_groups table)
# =========================================
@router.get("/groups")
def get_shipping_groups(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get all shipping groups from store DB."""
    site_id = get_site_id(request)
    store_db = None
    try:
        store_db = get_store_db(site_id, db)

        # Detect columns
        cols_result = store_db.execute(text("SHOW COLUMNS FROM shipping_groups")).fetchall()
        all_cols = {row[0] for row in cols_result}

        want_cols = ['sgroup_id', 'name', 'shipper_id', 'states', 'countries',
                     'start', 'end', 'rate', 'type', 'change_type', 'nonglobal']
        select_cols = [c for c in want_cols if c in all_cols]
        if not select_cols:
            return {"data": []}

        select_str = ', '.join(f'`{c}`' for c in select_cols)
        result = store_db.execute(text(
            f"SELECT {select_str} FROM shipping_groups ORDER BY `name`"
        )).fetchall()

        groups = []
        for row in result:
            g = {}
            for col in select_cols:
                val = getattr(row, col, '')
                g[col] = str(val) if val is not None else ''
            # Map sgroup_id to id for frontend compatibility
            if 'sgroup_id' in g:
                g['id'] = g['sgroup_id']
            groups.append(g)

        return {"data": groups}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.delete("/groups/{group_id}")
def delete_shipping_group(
    group_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete a shipping group from store DB."""
    site_id = get_site_id(request)
    store_db = None
    try:
        store_db = get_store_db(site_id, db)
        store_db.execute(text("DELETE FROM shipping_groups WHERE sgroup_id = :id"), {"id": group_id})
        store_db.commit()
        return {"message": "Shipping group deleted successfully"}
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


# =========================================
# PRESET SHIP DATES (store DB - ship_dates table, is_blackout='n')
# =========================================
@router.get("/options/preset-dates")
def get_preset_dates(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get preset ship dates from ship_dates table in store DB."""
    site_id = get_site_id(request)
    store_db = None
    try:
        store_db = get_store_db(site_id, db)
        result = store_db.execute(text(
            "SELECT id, description, month, day, display_order, start_date, stop_date, is_blackout "
            "FROM ship_dates WHERE is_blackout = 'n' ORDER BY display_order"
        )).fetchall()

        dates = []
        for row in result:
            dates.append({
                "id": row.id,
                "description": row.description or '',
                "month": row.month or '',
                "day": row.day or '',
                "display_order": row.display_order,
                "start_date": str(row.start_date) if row.start_date else '',
                "stop_date": str(row.stop_date) if row.stop_date else '',
            })

        return {"data": dates}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/options/preset-dates")
def save_preset_date(
    request: Request,
    data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Add or update a preset ship date."""
    site_id = get_site_id(request)
    store_db = None
    try:
        store_db = get_store_db(site_id, db)

        date_id = data.get("id")
        if date_id:
            # Update existing
            store_db.execute(text(
                "UPDATE ship_dates SET description = :description, month = :month, "
                "day = :day, start_date = :start_date, stop_date = :stop_date, static = NULL "
                "WHERE id = :id"
            ), {
                "id": date_id,
                "description": data.get("description", ""),
                "month": data.get("month", ""),
                "day": data.get("day", ""),
                "start_date": data.get("start_date", ""),
                "stop_date": data.get("stop_date", ""),
            })
        else:
            # Get next display_order
            ord_row = store_db.execute(text(
                "SELECT display_order FROM ship_dates ORDER BY display_order DESC LIMIT 1"
            )).fetchone()
            order = (ord_row.display_order + 1) if ord_row and ord_row.display_order else 1

            store_db.execute(text(
                "INSERT INTO ship_dates (description, month, day, start_date, stop_date, "
                "display_order, is_blackout, static) VALUES (:description, :month, :day, "
                ":start_date, :stop_date, :display_order, 'n', NULL)"
            ), {
                "description": data.get("description", ""),
                "month": data.get("month", ""),
                "day": data.get("day", ""),
                "start_date": data.get("start_date", ""),
                "stop_date": data.get("stop_date", ""),
                "display_order": order,
            })

        store_db.commit()
        return {"message": "Preset ship date saved successfully"}
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.delete("/options/preset-dates/{date_id}")
def delete_preset_date(
    date_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete a preset ship date."""
    site_id = get_site_id(request)
    store_db = None
    try:
        store_db = get_store_db(site_id, db)
        store_db.execute(text("DELETE FROM ship_dates WHERE id = :id"), {"id": date_id})
        store_db.commit()
        return {"message": "Preset ship date deleted successfully"}
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


# =========================================
# BLACKOUT DATES (store DB - ship_dates table, is_blackout='y')
# =========================================
@router.get("/options/blackout")
def get_blackout_dates(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get blackout dates from ship_dates table in store DB."""
    site_id = get_site_id(request)
    store_db = None
    try:
        store_db = get_store_db(site_id, db)
        result = store_db.execute(text(
            "SELECT id, description, month, day, display_order, start_date, stop_date, is_blackout "
            "FROM ship_dates WHERE is_blackout = 'y' ORDER BY display_order"
        )).fetchall()

        dates = []
        for row in result:
            dates.append({
                "id": row.id,
                "description": row.description or '',
                "month": row.month or '',
                "day": row.day or '',
                "display_order": row.display_order,
                "start_date": str(row.start_date) if row.start_date else '',
                "stop_date": str(row.stop_date) if row.stop_date else '',
            })

        return {"data": dates}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/options/blackout")
def save_blackout_date(
    request: Request,
    data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Add or update a blackout date."""
    site_id = get_site_id(request)
    store_db = None
    try:
        store_db = get_store_db(site_id, db)

        date_id = data.get("id")
        if date_id:
            store_db.execute(text(
                "UPDATE ship_dates SET description = :description, month = :month, "
                "day = :day, start_date = :start_date, stop_date = :stop_date, static = NULL "
                "WHERE id = :id"
            ), {
                "id": date_id,
                "description": data.get("description", ""),
                "month": data.get("month", ""),
                "day": data.get("day", ""),
                "start_date": data.get("start_date", ""),
                "stop_date": data.get("stop_date", ""),
            })
        else:
            ord_row = store_db.execute(text(
                "SELECT display_order FROM ship_dates ORDER BY display_order DESC LIMIT 1"
            )).fetchone()
            order = (ord_row.display_order + 1) if ord_row and ord_row.display_order else 1

            store_db.execute(text(
                "INSERT INTO ship_dates (description, month, day, start_date, stop_date, "
                "display_order, is_blackout, static) VALUES (:description, :month, :day, "
                ":start_date, :stop_date, :display_order, 'y', NULL)"
            ), {
                "description": data.get("description", ""),
                "month": data.get("month", ""),
                "day": data.get("day", ""),
                "start_date": data.get("start_date", ""),
                "stop_date": data.get("stop_date", ""),
                "display_order": order,
            })

        store_db.commit()
        return {"message": "Blackout date saved successfully"}
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.delete("/options/blackout/{date_id}")
def delete_blackout_date(
    date_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete a blackout date."""
    site_id = get_site_id(request)
    store_db = None
    try:
        store_db = get_store_db(site_id, db)
        store_db.execute(text("DELETE FROM ship_dates WHERE id = :id"), {"id": date_id})
        store_db.commit()
        return {"message": "Blackout date deleted successfully"}
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


# =========================================
# DIMENSIONAL SHIPPING (store DB - dimensional_shipping table)
# =========================================
@router.get("/options/dimensional")
def get_dimensional_shipping(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get dimensional shipping boxes from store DB."""
    site_id = get_site_id(request)
    store_db = None
    try:
        store_db = get_store_db(site_id, db)
        result = store_db.execute(text(
            "SELECT id, length, width, height, volume FROM dimensional_shipping ORDER BY id"
        )).fetchall()

        boxes = []
        for row in result:
            boxes.append({
                "id": row.id,
                "length": str(row.length) if row.length is not None else '',
                "width": str(row.width) if row.width is not None else '',
                "height": str(row.height) if row.height is not None else '',
                "volume": str(row.volume) if row.volume is not None else '',
            })

        return {"data": boxes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/options/dimensional")
def save_dimensional_shipping(
    request: Request,
    data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Add or update dimensional shipping box."""
    site_id = get_site_id(request)
    store_db = None
    try:
        store_db = get_store_db(site_id, db)

        box_id = data.get("id")
        length = data.get("length", 0)
        width = data.get("width", 0)
        height = data.get("height", 0)

        # Calculate volume
        try:
            volume = float(length) * float(width) * float(height)
        except (ValueError, TypeError):
            volume = 0

        if box_id:
            store_db.execute(text(
                "UPDATE dimensional_shipping SET length = :length, width = :width, "
                "height = :height, volume = :volume WHERE id = :id"
            ), {"id": box_id, "length": length, "width": width, "height": height, "volume": volume})
        else:
            store_db.execute(text(
                "INSERT INTO dimensional_shipping (length, width, height, volume) "
                "VALUES (:length, :width, :height, :volume)"
            ), {"length": length, "width": width, "height": height, "volume": volume})

        store_db.commit()
        return {"message": "Dimensional shipping box saved successfully"}
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.delete("/options/dimensional/{box_id}")
def delete_dimensional_box(
    box_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete a dimensional shipping box."""
    site_id = get_site_id(request)
    store_db = None
    try:
        store_db = get_store_db(site_id, db)
        store_db.execute(text("DELETE FROM dimensional_shipping WHERE id = :id"), {"id": box_id})
        store_db.commit()
        return {"message": "Dimensional shipping box deleted successfully"}
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


# =========================================
# SHIPPING RATE TOOLS
# =========================================
# Explicit field lists per carrier matching the old platform exactly
RATE_TOOL_FIELDS = {
    'custom': [
        'api_calc', 'ship_url', 'use_for_tax_calc', 'ship_post_type',
        'custom_shipping_api_version', 'custom_shipping_api_username',
        'custom_shipping_api_password', 'custom_shipping_api_key',
    ],
    'ups': [
        'rate_calc', 'excl_address', 'ship_from_zip', 'calc_type', 'num_per_box',
        'ship_type', 'min_ups', 'ups_rate_type', 'ups_time_in_transit',
        'ups_transit_fixed', 'ups_freight_user', 'ups_freight_password',
        'ups_freight_access_key', 'ups_freight_ship_num',
        'ups_freight_client_id', 'ups_freight_client_secret',
        'ups_freight_default_auth',
    ],
    'fedex': [
        'fedex_rate_calc', 'fedex_valadd', 'fedex_server', 'fedex_ship_type',
        'fedex_calc_type', 'fedex_num_per_box', 'fedex_min',
        'fedex_discount_to_net', 'fedex_transit_time',
        'fedex_rest_default_auth',
        'fedex_account_key', 'fedex_account_pass', 'fedex_account_num', 'fedex_meter_num',
        'fedex_rest_client_id', 'fedex_rest_client_secret',
        'fedex_from_state', 'fedex_ship_from_zip', 'fedex_from_country',
        'fedex_freight_account_num', 'fedex_freight_address', 'fedex_freight_address2',
        'fedex_freight_city', 'fedex_freight_state', 'fedex_freight_zip',
        'fedex_freight_country', 'fedex_freight_from',
    ],
    'usps': [
        'usps_rate_calc', 'usps_user_id', 'usps_live', 'usps_ship_from_zip',
        'usps_calc_type', 'usps_num_per_box', 'usps_min',
    ],
    'abf': [
        'abf_rate_calc', 'abf_min', 'abf_acct_num', 'abf_pass',
        'abf_from_city', 'abf_from_state', 'abf_from_zip', 'abf_from_country',
    ],
    'conway': [
        'cw_rate_calc', 'cw_min', 'cw_customer_num', 'cw_user', 'cw_pass',
        'cw_from_zip', 'cw_from_country',
    ],
}


@router.get("/rate-tool/{provider}")
def get_shipping_rate_tool(
    provider: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get shipping rate tool options for a specific provider."""
    site_id = get_site_id(request)

    if provider not in RATE_TOOL_FIELDS:
        raise HTTPException(status_code=400, detail=f"Unknown provider: {provider}")

    try:
        try:
            cols_result = db.execute(text("SHOW COLUMNS FROM shipping_options")).fetchall()
            all_cols = {row[0] for row in cols_result}
        except Exception:
            return {"data": {}}

        # Use explicit field list, filtered to columns that actually exist
        relevant_cols = [c for c in RATE_TOOL_FIELDS[provider] if c in all_cols]

        if not relevant_cols:
            # Return empty defaults for all expected fields
            return {"data": {c: '' for c in RATE_TOOL_FIELDS[provider]}}

        select_cols = ", ".join(f"`{c}`" for c in relevant_cols)
        result = db.execute(
            text(f"SELECT {select_cols} FROM shipping_options WHERE site_id = :site_id"),
            {"site_id": site_id}
        ).first()

        if not result:
            return {"data": {c: '' for c in RATE_TOOL_FIELDS[provider]}}

        data = {}
        for col in RATE_TOOL_FIELDS[provider]:
            if col in relevant_cols:
                val = getattr(result, col, '') or ''
                data[col] = str(val)
            else:
                data[col] = ''
        return {"data": data}

    except Exception as e:
        return {"data": {c: '' for c in RATE_TOOL_FIELDS[provider]}}


@router.post("/rate-tool/{provider}")
def save_shipping_rate_tool(
    provider: str,
    options: Dict[str, Any],
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save shipping rate tool options for a specific provider."""
    site_id = get_site_id(request)

    if provider not in RATE_TOOL_FIELDS:
        raise HTTPException(status_code=400, detail=f"Unknown provider: {provider}")

    try:
        try:
            cols_result = db.execute(text("SHOW COLUMNS FROM shipping_options")).fetchall()
            all_cols = {row[0] for row in cols_result}
        except Exception:
            raise HTTPException(status_code=500, detail="shipping_options table not found")

        allowed_fields = set(RATE_TOOL_FIELDS[provider])
        updates = []
        params = {"site_id": site_id}
        for key, value in options.items():
            if key == 'site_id' or key not in all_cols or key not in allowed_fields:
                continue
            updates.append(f"`{key}` = :{key}")
            params[key] = value if value != '' else None

        if updates:
            query = f"UPDATE shipping_options SET {', '.join(updates)} WHERE site_id = :site_id"
            db.execute(text(query), params)
            db.commit()

        return {"message": f"Shipping rate tool ({provider}) options saved successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# SHIPWORKS OPTIONS
# =========================================
@router.get("/options/shipworks")
def get_shipworks_options(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get ShipWorks integration options."""
    site_id = get_site_id(request)

    try:
        try:
            cols_result = db.execute(text("SHOW COLUMNS FROM shipping_options")).fetchall()
            all_cols = {row[0] for row in cols_result}
        except Exception:
            return {"data": {}}

        shipworks_cols = [c for c in all_cols if 'shipworks' in c.lower()]
        if not shipworks_cols:
            return {"data": {}}

        select_cols = ", ".join(f"`{c}`" for c in shipworks_cols)
        result = db.execute(
            text(f"SELECT {select_cols} FROM shipping_options WHERE site_id = :site_id"),
            {"site_id": site_id}
        ).first()

        if not result:
            return {"data": {}}

        data = {}
        for col in shipworks_cols:
            val = getattr(result, col, '') or ''
            data[col] = str(val)
        return {"data": data}

    except Exception as e:
        return {"data": {}}


@router.post("/options/shipworks")
def save_shipworks_options(
    options: Dict[str, Any],
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save ShipWorks integration options."""
    site_id = get_site_id(request)

    try:
        try:
            cols_result = db.execute(text("SHOW COLUMNS FROM shipping_options")).fetchall()
            col_types = {row[0]: str(row[1]).lower() for row in cols_result}
        except Exception:
            raise HTTPException(status_code=500, detail="shipping_options table not found")

        updates = []
        params = {"site_id": site_id}
        for key, value in options.items():
            if key == 'site_id' or key not in col_types:
                continue
            if 'shipworks' not in key.lower():
                continue
            updates.append(f"`{key}` = :{key}")
            params[key] = value if value != '' else None

        if updates:
            query = f"UPDATE shipping_options SET {', '.join(updates)} WHERE site_id = :site_id"
            db.execute(text(query), params)
            db.commit()

        return {"message": "ShipWorks options saved successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, Depends, HTTPException, Query, Path, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_user, get_current_admin_user
from app.utils.db_helpers import build_safe_update

router = APIRouter(prefix="/store", tags=["store-content"])


# ============================================================
# Display Options endpoints
# ============================================================
# NOTE: display_options is in the CENTRAL colorcommerce DB, not the store DB.
# The old platform reads/writes it via Store_Class::getOptions($site_id, 'display_options')

# Column groupings for option_type filtering
DISPLAY_OPTION_GROUPS = {
    "core": [
        "not_found", "not_found_start", "sitemap_invisible", "sitemap_display", "sitemap_linked",
        "display_cgroups", "featured_display", "new_display", "specials_display",
        "featured_cats_display", "featured_reviews_display", "display_default_featured_prods",
        "upsells_prods", "best_sellers", "best_sellers_display",
        "currency_type", "currency_type_cad", "product_mapping",
        "child_display_type", "additional_prod_display_type",
        "display_hidden_prods", "display_hidden_prods_cats",
        "floating_cart", "redirect_handling", "category_cfields",
        "cart_updates_data_available", "persistent_guest_cart",
        "billing_type", "bill_territories",
    ],
    "checkout": [
        "checkout_type", "show_checkout_display", "checkout_quick_swap",
        "checkout_product_desc", "hide_viewcart_discounts",
        "gift_msg_separate", "gift_msg_num_lines", "gift_msg_num_chars",
        "checkout_vendor_ship", "save_form", "save_forms",
        "simple_gateway_pages", "security_checkout_attempts",
        "security_terminate_session", "failed_cc_attempts_terminate_by", "failed_cc_attempts",
        "isolated_cc_collect_live", "isolated_cc_collect_staging",
    ],
    "optimization": [
        "page_caching", "page_caching_duration", "page_caching_minify",
        "overdrive_enable", "overdrive_settings",
    ],
    "search": [
        "search_sort", "search_sort_user_defined", "search_match_type",
        "search_prods", "search_fields", "search_ready",
        "search_redirect_andor", "search_limit_email_notify",
        "suppress_oos", "use_suggested_search", "suggested_search_update",
        "suggested_search_num", "recipe_search_match_type", "use_category_filter",
    ],
}


@router.get("/display-options/{option_type}")
def get_display_options(
    option_type: str = Path(..., description="Option type: core, checkout, optimization, search"),
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get display options by type from the central colorcommerce DB."""
    try:
        # Query central DB display_options table
        cols = [r[0] for r in db.execute(text("SHOW COLUMNS FROM display_options")).fetchall()]

        # Filter columns based on option_type group
        group_cols = DISPLAY_OPTION_GROUPS.get(option_type)
        if group_cols:
            # Only select columns that exist in the table AND are in the group
            select_cols = [c for c in group_cols if c in cols]
        else:
            # Unknown option_type - return all non-site_id columns
            select_cols = [c for c in cols if c != "site_id"]

        if not select_cols:
            return {"data": {}}

        col_str = ", ".join(select_cols)
        row = db.execute(
            text(f"SELECT {col_str} FROM display_options WHERE site_id = :sid"),
            {"sid": site_id}
        ).fetchone()

        options = {}
        if row:
            for i, col in enumerate(select_cols):
                options[col] = str(row[i]) if row[i] is not None else ""

        return {"data": options}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/display-options/{option_type}")
async def save_display_options(
    option_type: str = Path(..., description="Option type: core, checkout, optimization, search"),
    request: Request = None,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save display options by type to the central colorcommerce DB."""
    try:
        body = await request.json()

        # Filter to only columns in the requested group
        group_cols = DISPLAY_OPTION_GROUPS.get(option_type)
        build_safe_update(
            db, 'display_options', body, 'site_id', site_id,
            allowed_cols=group_cols
        )

        return {"message": f"Display {option_type} options saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# Suggested Search endpoints (store DB - cart_*)
# ============================================================

@router.get("/suggested-search")
def list_suggested_searches(
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List suggested search terms from the store DB."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")

        store_db = get_store_session(store_db_name)

        # Try to find suggested search table
        table_name = None
        for tbl in ["suggested_search", "search_suggestions", "search_terms"]:
            try:
                store_db.execute(text(f"SELECT 1 FROM {tbl} LIMIT 1"))
                table_name = tbl
                break
            except Exception:
                continue

        if not table_name:
            return {"data": [], "total": 0, "message": "No suggested search table found"}

        cols = [r[0] for r in store_db.execute(text(f"SHOW COLUMNS FROM {table_name}")).fetchall()]

        id_col = next((c for c in cols if c in ["id", "search_id", "term_id"]), cols[0])
        term_col = next((c for c in cols if c in ["term", "search_term", "keyword", "name", "phrase"]), None)

        select_cols = [id_col]
        if term_col:
            select_cols.append(term_col)
        for c in cols:
            if c not in select_cols and c not in ["inactive"]:
                select_cols.append(c)

        query = f"SELECT {', '.join(select_cols)} FROM {table_name} ORDER BY {id_col}"
        rows = store_db.execute(text(query)).fetchall()

        items = []
        for row in rows:
            item = {"id": str(getattr(row, id_col))}
            if term_col:
                item["term"] = getattr(row, term_col, "") or ""
            for c in select_cols:
                if c not in [id_col, term_col]:
                    val = getattr(row, c, None)
                    item[c] = str(val) if val is not None else ""
            items.append(item)

        return {"data": items, "total": len(items)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/suggested-search")
async def add_suggested_search(
    request: Request,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Add a suggested search term."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")

        store_db = get_store_session(store_db_name)
        body = await request.json()

        table_name = None
        for tbl in ["suggested_search", "search_suggestions", "search_terms"]:
            try:
                store_db.execute(text(f"SELECT 1 FROM {tbl} LIMIT 1"))
                table_name = tbl
                break
            except Exception:
                continue

        if not table_name:
            raise HTTPException(status_code=404, detail="Suggested search table not found")

        cols = [r[0] for r in store_db.execute(text(f"SHOW COLUMNS FROM {table_name}")).fetchall()]
        id_col = next((c for c in cols if c in ["id", "search_id", "term_id"]), cols[0])

        insert_cols = []
        params = {}
        for key, value in body.items():
            if key in cols and key != id_col:
                insert_cols.append(key)
                params[key] = value

        if insert_cols:
            col_str = ", ".join(insert_cols)
            val_str = ", ".join(f":{c}" for c in insert_cols)
            store_db.execute(text(f"INSERT INTO {table_name} ({col_str}) VALUES ({val_str})"), params)
            store_db.commit()

        return {"message": "Suggested search term added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.delete("/suggested-search/{term_id}")
def delete_suggested_search(
    term_id: int = Path(...),
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete a suggested search term."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")

        store_db = get_store_session(store_db_name)

        table_name = None
        for tbl in ["suggested_search", "search_suggestions", "search_terms"]:
            try:
                store_db.execute(text(f"SELECT 1 FROM {tbl} LIMIT 1"))
                table_name = tbl
                break
            except Exception:
                continue

        if not table_name:
            raise HTTPException(status_code=404, detail="Suggested search table not found")

        cols = [r[0] for r in store_db.execute(text(f"SHOW COLUMNS FROM {table_name}")).fetchall()]
        id_col = next((c for c in cols if c in ["id", "search_id", "term_id"]), cols[0])

        store_db.execute(text(f"DELETE FROM {table_name} WHERE {id_col} = :id"), {"id": term_id})
        store_db.commit()

        return {"message": "Suggested search term deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


# ============================================================
# Catalog Display endpoints (central colorcommerce DB)
# ============================================================

@router.get("/catalog-display/{option_type}")
def get_catalog_display_options(
    option_type: str = Path(..., description="Option type: core"),
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get catalog display options from the central colorcommerce DB."""
    try:
        cols = [r[0] for r in db.execute(text("SHOW COLUMNS FROM catalog_display_options")).fetchall()]
        select_cols = [c for c in cols if c != "site_id"]

        if not select_cols:
            return {"data": {}}

        col_str = ", ".join(select_cols)
        row = db.execute(
            text(f"SELECT {col_str} FROM catalog_display_options WHERE site_id = :sid"),
            {"sid": site_id}
        ).fetchone()

        options = {}
        if row:
            for i, col in enumerate(select_cols):
                options[col] = str(row[i]) if row[i] is not None else ""

        return {"data": options}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/catalog-display/{option_type}")
async def save_catalog_display_options(
    option_type: str = Path(..., description="Option type: core"),
    request: Request = None,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save catalog display options to the central colorcommerce DB."""
    try:
        body = await request.json()
        build_safe_update(db, 'catalog_display_options', body, 'site_id', site_id)
        return {"message": f"Catalog display {option_type} options saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# SLI endpoint (central colorcommerce DB - sli_export table)
# ============================================================

@router.get("/sli")
def get_sli(
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get SLI (Search/List/Index) export configuration from the central colorcommerce DB."""
    try:
        cols = [r[0] for r in db.execute(text("SHOW COLUMNS FROM sli_export")).fetchall()]
        select_cols = [c for c in cols if c != "site_id"]

        if not select_cols:
            return {"data": {}}

        col_str = ", ".join(select_cols)
        row = db.execute(
            text(f"SELECT {col_str} FROM sli_export WHERE site_id = :sid"),
            {"sid": site_id}
        ).fetchone()

        data = {}
        if row:
            for i, col in enumerate(select_cols):
                data[col] = str(row[i]) if row[i] is not None else ""

        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sli")
async def save_sli(
    request: Request,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save SLI export configuration to the central colorcommerce DB."""
    try:
        body = await request.json()
        build_safe_update(db, 'sli_export', body, 'site_id', site_id)
        return {"message": "SLI export configuration saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

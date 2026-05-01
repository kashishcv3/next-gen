from fastapi import APIRouter, Depends, HTTPException, Query, Path, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_user, get_current_admin_user

router = APIRouter(prefix="/store", tags=["store-content"])


# ============================================================
# Display Options endpoints
# ============================================================

DISPLAY_OPTION_PREFIXES = {
    "core": ["display_", "show_", "hide_", "enable_", "disable_"],
    "checkout": ["checkout_", "cart_", "order_"],
    "optimization": ["optimize_", "cache_", "compress_", "perf_", "speed_"],
    "search": ["search_", "find_", "filter_", "sort_"],
}


@router.get("/display-options/{option_type}")
def get_display_options(
    option_type: str = Path(..., description="Option type: core, checkout, optimization, search"),
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get display options by type from site_options."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")

        store_db = get_store_session(store_db_name)

        options = {}
        try:
            cols = [r[0] for r in store_db.execute(text("SHOW COLUMNS FROM site_options")).fetchall()]
            prefixes = DISPLAY_OPTION_PREFIXES.get(option_type, [option_type + "_"])
            matching_cols = [c for c in cols if any(c.lower().startswith(p) for p in prefixes)]

            if matching_cols:
                col_str = ", ".join(matching_cols)
                row = store_db.execute(text(f"SELECT {col_str} FROM site_options LIMIT 1")).fetchone()
                if row:
                    for i, col in enumerate(matching_cols):
                        options[col] = str(row[i]) if row[i] is not None else ""
        except Exception:
            pass

        if not options:
            try:
                rows = store_db.execute(text(
                    "SELECT option_name, option_value FROM site_options "
                    "WHERE option_type = :opt_type"
                ), {"opt_type": f"display_{option_type}"}).fetchall()
                for row in rows:
                    options[row.option_name] = row.option_value or ""
            except Exception:
                pass

        return {"data": options}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/display-options/{option_type}")
async def save_display_options(
    option_type: str = Path(..., description="Option type: core, checkout, optimization, search"),
    request: Request = None,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save display options by type."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")

        store_db = get_store_session(store_db_name)
        body = await request.json()

        try:
            cols = [r[0] for r in store_db.execute(text("SHOW COLUMNS FROM site_options")).fetchall()]
            updates = []
            params = {}
            for key, value in body.items():
                if key in cols:
                    updates.append(f"{key} = :{key}")
                    params[key] = value
            if updates:
                store_db.execute(text(f"UPDATE site_options SET {', '.join(updates)}"), params)
                store_db.commit()
        except Exception:
            for key, value in body.items():
                store_db.execute(text(
                    "INSERT INTO site_options (option_type, option_name, option_value) "
                    "VALUES (:opt_type, :key, :value) "
                    "ON DUPLICATE KEY UPDATE option_value = :value"
                ), {"opt_type": f"display_{option_type}", "key": key, "value": value})
            store_db.commit()

        return {"message": f"Display {option_type} options saved successfully"}
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
# Suggested Search endpoints
# ============================================================

@router.get("/suggested-search")
def list_suggested_searches(
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List suggested search terms."""
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
        # Add any other columns
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
# Catalog Display endpoints
# ============================================================

@router.get("/catalog-display/{option_type}")
def get_catalog_display_options(
    option_type: str = Path(..., description="Option type: core"),
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get catalog display options."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")

        store_db = get_store_session(store_db_name)

        options = {}
        try:
            cols = [r[0] for r in store_db.execute(text("SHOW COLUMNS FROM site_options")).fetchall()]
            catalog_cols = [c for c in cols if any(p in c.lower() for p in [
                "catalog_", "cat_display_", "product_display_", "listing_",
                "grid_", "thumbnail_", "prods_per_page", "category_display"
            ])]
            if catalog_cols:
                col_str = ", ".join(catalog_cols)
                row = store_db.execute(text(f"SELECT {col_str} FROM site_options LIMIT 1")).fetchone()
                if row:
                    for i, col in enumerate(catalog_cols):
                        options[col] = str(row[i]) if row[i] is not None else ""
        except Exception:
            pass

        return {"data": options}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/catalog-display/{option_type}")
async def save_catalog_display_options(
    option_type: str = Path(..., description="Option type: core"),
    request: Request = None,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save catalog display options."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")

        store_db = get_store_session(store_db_name)
        body = await request.json()

        try:
            cols = [r[0] for r in store_db.execute(text("SHOW COLUMNS FROM site_options")).fetchall()]
            updates = []
            params = {}
            for key, value in body.items():
                if key in cols:
                    updates.append(f"{key} = :{key}")
                    params[key] = value
            if updates:
                store_db.execute(text(f"UPDATE site_options SET {', '.join(updates)}"), params)
                store_db.commit()
        except Exception:
            pass

        return {"message": f"Catalog display {option_type} options saved successfully"}
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
# SLI endpoint
# ============================================================

@router.get("/sli")
def get_sli(
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get SLI (Search/List/Index) configuration."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")

        store_db = get_store_session(store_db_name)

        data = {}
        # Try sli table
        try:
            cols = [r[0] for r in store_db.execute(text("SHOW COLUMNS FROM sli")).fetchall()]
            col_str = ", ".join(cols)
            row = store_db.execute(text(f"SELECT {col_str} FROM sli LIMIT 1")).fetchone()
            if row:
                for i, col in enumerate(cols):
                    data[col] = str(row[i]) if row[i] is not None else ""
            return {"data": data}
        except Exception:
            pass

        # Try site_options with sli prefix
        try:
            cols = [r[0] for r in store_db.execute(text("SHOW COLUMNS FROM site_options")).fetchall()]
            sli_cols = [c for c in cols if c.lower().startswith("sli_")]
            if sli_cols:
                col_str = ", ".join(sli_cols)
                row = store_db.execute(text(f"SELECT {col_str} FROM site_options LIMIT 1")).fetchone()
                if row:
                    for i, col in enumerate(sli_cols):
                        data[col] = str(row[i]) if row[i] is not None else ""
        except Exception:
            pass

        return {"data": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()

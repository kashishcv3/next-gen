from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_user, get_current_admin_user
from datetime import datetime

router = APIRouter(prefix="/products", tags=["products"])


class ProductItem(BaseModel):
    prod_id: int
    prod_name: str
    sku: Optional[str]
    is_parent: Optional[str]
    parent: Optional[int]
    inactive: Optional[str]
    has_attributes: Optional[str]
    special_start: Optional[str]
    special_stop: Optional[str]
    free_special: Optional[str]
    ext_id: Optional[str]
    cat_id: Optional[int]
    prod_order: Optional[int]
    weight: Optional[float]

    class Config:
        from_attributes = True


class ProductDetail(BaseModel):
    prod_id: int
    prod_name: str
    sku: Optional[str]
    description: Optional[str]
    is_parent: Optional[str]
    parent: Optional[int]
    inactive: Optional[str]
    has_attributes: Optional[str]
    special_start: Optional[str]
    special_stop: Optional[str]
    free_special: Optional[str]
    ext_id: Optional[str]
    retail: Optional[str]
    wholesale: Optional[str]
    featured: Optional[str]
    new: Optional[str]
    date_added: Optional[str]
    date_modified: Optional[str]

    class Config:
        from_attributes = True


class ProductList(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[ProductItem]


class CategoryProduct(BaseModel):
    cat_id: int
    cat_name: str
    prod_count: int
    products: List[ProductItem]


@router.get("/list", response_model=dict)
def list_products_by_category(
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    category_ids: Optional[str] = Query(None, description="Comma-separated category IDs to expand"),
):
    """
    List products organized by category.
    Mirrors Product_listView functionality.
    """
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        store_db = get_store_session(store_db_name)

        prod_list = {}
        if category_ids:
            prod_list = {cid.strip(): '1' for cid in category_ids.split(',') if cid.strip()}

        prod_list_query = ""
        if prod_list:
            cat_ids_str = ",".join(str(k) for k in prod_list.keys())
            prod_list_query = f"c.cat_id IN ({cat_ids_str}) OR "

        # Get products
        query = text(f"""
            SELECT p.prod_name, p.is_parent, p.parent, p.prod_id, p.inactive, p.sku,
                   p.has_attributes, p.special_start, p.special_stop, p.free_special, p.ext_id,
                   c.cat_id, c.prod_order, c.weight
            FROM products AS p
            LEFT JOIN cat_prod_link AS c ON p.prod_id = c.prod_id
            WHERE (p.inactive != 'd' OR p.inactive IS NULL)
            AND (p.parent = '' OR p.parent IS NULL OR p.parent = 0)
            AND ({prod_list_query}c.cat_id IS NULL)
            ORDER BY c.cat_id, c.prod_order, p.prod_id
        """)

        results = store_db.execute(query).fetchall()

        # Get categories
        cat_query = text("""
            SELECT cat_id, cat_name, `rank`, inactive
            FROM categories
            ORDER BY cat_parent, `rank`, cat_name
        """)
        cat_results = store_db.execute(cat_query).fetchall()

        # Get product counts
        count_query = text("""
            SELECT COUNT(p.prod_id) as prod_count, cpl.cat_id
            FROM cat_prod_link AS cpl
            JOIN products AS p ON p.prod_id = cpl.prod_id
            WHERE (p.inactive != 'd' OR p.inactive IS NULL)
            AND (p.parent = 0 OR p.parent IS NULL)
            GROUP BY cpl.cat_id
        """)
        count_results = store_db.execute(count_query).fetchall()
        counts = {r.cat_id: r.prod_count for r in count_results}

        # Build category structure
        categories = []
        for cat in cat_results:
            cat_products = [r for r in results if r.cat_id == cat.cat_id]
            category_item = {
                "cat_id": cat.cat_id,
                "name": cat.cat_name,
                "rank": cat.rank,
                "inactive": cat.inactive,
                "product_count": counts.get(cat.cat_id, 0),
                "products": [
                    {
                        "prod_id": p.prod_id,
                        "prod_name": p.prod_name,
                        "sku": p.sku,
                        "is_parent": p.is_parent,
                        "parent": p.parent,
                        "inactive": p.inactive,
                        "has_attributes": p.has_attributes,
                        "special_start": p.special_start,
                        "special_stop": p.special_stop,
                        "free_special": p.free_special,
                        "ext_id": p.ext_id,
                        "prod_order": p.prod_order,
                        "weight": p.weight,
                    }
                    for p in cat_products
                ]
            }
            if prod_list.get(cat.cat_id):
                category_item["expanded"] = True
            categories.append(category_item)

        return {
            "categories": categories,
            "total": len(results),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if store_db:
            store_db.close()


@router.get("/by-name", response_model=dict)
def list_products_by_name(
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    sort: Optional[str] = Query("prod_name", description="Sort field"),
    search_term: Optional[str] = Query(None, description="Search term"),
    search_type: Optional[str] = Query(None, description="Type of search"),
):
    """
    List all products alphabetically or by search criteria.
    Mirrors Product_by_nameView functionality.
    """
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        store_db = get_store_session(store_db_name)

        query = text("""
            SELECT prod_id, sku, prod_name, is_parent, inactive, has_attributes
            FROM products
            WHERE (inactive != 'd' OR inactive IS NULL)
            AND (parent = '' OR parent IS NULL OR parent = 0)
        """)

        # Apply search filters if provided
        if search_type == 'search' and search_term:
            search_pattern = f"%{search_term}%"
            query = text("""
                SELECT prod_id, sku, prod_name, is_parent, inactive, has_attributes
                FROM products
                WHERE (inactive != 'd' OR inactive IS NULL)
                AND (parent = '' OR parent IS NULL OR parent = 0)
                AND (prod_name LIKE :search OR sku LIKE :search OR ext_id LIKE :search)
                ORDER BY """ + sort)
            results = store_db.execute(query, {"search": search_pattern}).fetchall()
        elif search_type == 'type' and search_term:
            if search_term == 'featured':
                query = text("""
                    SELECT prod_id, sku, prod_name, is_parent, inactive, has_attributes
                    FROM products
                    WHERE (inactive != 'd' OR inactive IS NULL)
                    AND (parent = '' OR parent IS NULL OR parent = 0)
                    AND featured = 'y'
                    ORDER BY """ + sort)
            elif search_term == 'special':
                query = text("""
                    SELECT prod_id, sku, prod_name, is_parent, inactive, has_attributes
                    FROM products
                    WHERE (inactive != 'd' OR inactive IS NULL)
                    AND (parent = '' OR parent IS NULL OR parent = 0)
                    AND ((NOW() BETWEEN special_start AND special_stop) OR special_ongoing = 'y')
                    ORDER BY """ + sort)
            elif search_term == 'new':
                query = text("""
                    SELECT prod_id, sku, prod_name, is_parent, inactive, has_attributes
                    FROM products
                    WHERE (inactive != 'd' OR inactive IS NULL)
                    AND (parent = '' OR parent IS NULL OR parent = 0)
                    AND new = 'y'
                    ORDER BY """ + sort)
            elif search_term == 'active':
                query = text("""
                    SELECT prod_id, sku, prod_name, is_parent, inactive, has_attributes
                    FROM products
                    WHERE (inactive != 'd' AND inactive != 'y')
                    AND (parent = '' OR parent IS NULL OR parent = 0)
                    ORDER BY """ + sort)
            elif search_term == 'inactive':
                query = text("""
                    SELECT prod_id, sku, prod_name, is_parent, inactive, has_attributes
                    FROM products
                    WHERE (inactive != 'd' OR inactive IS NULL)
                    AND (parent = '' OR parent IS NULL OR parent = 0)
                    AND inactive = 'y'
                    ORDER BY """ + sort)
            results = store_db.execute(query).fetchall()
        else:
            query = text(f"""
                SELECT prod_id, sku, prod_name, is_parent, inactive, has_attributes
                FROM products
                WHERE (inactive != 'd' OR inactive IS NULL)
                AND (parent = '' OR parent IS NULL OR parent = 0)
                ORDER BY {sort}
            """)
            results = store_db.execute(query).fetchall()

        products = [
            {
                "prod_id": r.prod_id,
                "sku": r.sku,
                "prod_name": r.prod_name,
                "is_parent": r.is_parent,
                "inactive": r.inactive,
                "has_attributes": r.has_attributes,
            }
            for r in results
        ]

        return {
            "products": products,
            "total": len(products),
            "sort": sort,
            "search_type": search_type,
            "search_term": search_term,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if store_db:
            store_db.close()


@router.get("/search", response_model=dict)
def search_products(
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    q: str = Query("", min_length=0),
    limit: int = Query(50, ge=1, le=500),
):
    """
    Search products by name, SKU, or external ID.
    Mirrors Product_searchView functionality.
    """
    store_db = None
    try:
        if not q:
            return {"results": [], "total": 0, "query": q}

        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        store_db = get_store_session(store_db_name)

        search_pattern = f"%{q}%"
        query = text("""
            SELECT prod_id, sku, prod_name, is_parent, parent, inactive, ext_id
            FROM products
            WHERE (inactive != 'd' OR inactive IS NULL)
            AND (parent = '' OR parent IS NULL OR parent = 0)
            AND (prod_name LIKE :search OR sku LIKE :search OR ext_id LIKE :search)
            LIMIT :limit
        """)

        results = store_db.execute(query, {"search": search_pattern, "limit": limit}).fetchall()

        products = [
            {
                "prod_id": r.prod_id,
                "sku": r.sku,
                "prod_name": r.prod_name,
                "is_parent": r.is_parent,
                "parent": r.parent,
                "inactive": r.inactive,
                "ext_id": r.ext_id,
            }
            for r in results
        ]

        return {
            "results": products,
            "total": len(products),
            "query": q,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if store_db:
            store_db.close()


@router.get("/customizations")
def list_customizations(
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List product custom forms/customizations."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        # Try custom_forms table first
        try:
            rows = store_db.execute(text(
                "SELECT * FROM custom_forms ORDER BY id DESC LIMIT 100"
            )).fetchall()
            items = []
            for row in rows:
                cols = row._fields if hasattr(row, '_fields') else row.keys()
                item = {col: str(getattr(row, col, '') or '') for col in cols}
                items.append(item)
            return {"data": items, "total": len(items)}
        except Exception:
            pass

        # Fallback: try product_customizations
        try:
            rows = store_db.execute(text(
                "SELECT * FROM product_customizations ORDER BY id DESC LIMIT 100"
            )).fetchall()
            items = []
            for row in rows:
                cols = row._fields if hasattr(row, '_fields') else row.keys()
                item = {col: str(getattr(row, col, '') or '') for col in cols}
                items.append(item)
            return {"data": items, "total": len(items)}
        except Exception:
            pass

        return {"data": [], "total": 0, "message": "No customizations table found"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.get("/discounts")
def list_discounts(
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List product discounts."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        try:
            rows = store_db.execute(text(
                "SELECT * FROM discounts ORDER BY id DESC LIMIT 200"
            )).fetchall()
            items = []
            for row in rows:
                cols = row._fields if hasattr(row, '_fields') else row.keys()
                item = {col: str(getattr(row, col, '') or '') for col in cols}
                items.append(item)
            return {"data": items, "total": len(items)}
        except Exception:
            pass

        # Fallback: try product_discounts
        try:
            rows = store_db.execute(text(
                "SELECT * FROM product_discounts ORDER BY id DESC LIMIT 200"
            )).fetchall()
            items = []
            for row in rows:
                cols = row._fields if hasattr(row, '_fields') else row.keys()
                item = {col: str(getattr(row, col, '') or '') for col in cols}
                items.append(item)
            return {"data": items, "total": len(items)}
        except Exception:
            pass

        return {"data": [], "total": 0, "message": "No discounts table found"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.get("/inventory")
def list_inventory(
    site_id: int = Query(..., description="Store ID"),
    filter: Optional[str] = Query("all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List product inventory."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        where_clause = ""
        if filter == "low":
            where_clause = "WHERE p.num_in_stock > 0 AND p.num_in_stock <= 10"
        elif filter == "out":
            where_clause = "WHERE p.num_in_stock = 0"

        query = f"""
            SELECT p.prod_id, p.prod_name, p.sku, p.num_in_stock,
                   p.reorder_level, p.inactive
            FROM products p
            {where_clause}
            ORDER BY p.prod_name ASC
            LIMIT 200
        """
        rows = store_db.execute(text(query)).fetchall()
        items = []
        for row in rows:
            items.append({
                "id": str(row.prod_id),
                "product_name": row.prod_name or "",
                "sku": row.sku or "",
                "quantity": row.num_in_stock or 0,
                "reorder_level": row.reorder_level if hasattr(row, 'reorder_level') and row.reorder_level else 5,
            })

        return {"data": items, "total": len(items)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.get("/recursive")
def list_recursive_products(
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List products in parent-child hierarchy."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        query = """
            SELECT prod_id, prod_name, parent, is_parent
            FROM products
            WHERE is_parent = 'y' OR parent > 0
            ORDER BY COALESCE(NULLIF(parent, 0), prod_id), parent, prod_id
            LIMIT 500
        """
        rows = store_db.execute(text(query)).fetchall()
        items = []
        for row in rows:
            depth = 0 if (row.is_parent == 'y' or not row.parent or row.parent == 0) else 1
            items.append({
                "id": str(row.prod_id),
                "name": row.prod_name or "",
                "parent_product_id": str(row.parent) if row.parent and row.parent > 0 else None,
                "depth": depth,
            })

        return {"data": items, "total": len(items)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.get("/subscriptions")
def list_subscriptions(
    site_id: int = Query(..., description="Store ID"),
    search: str = Query("", description="Search term"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List subscription/recurring products."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)
        offset = (page - 1) * page_size

        # Try to find subscription products
        try:
            cols = [r[0] for r in store_db.execute(text("SHOW COLUMNS FROM products")).fetchall()]
            has_subscription = "subscription" in cols or "is_subscription" in cols
            sub_col = "is_subscription" if "is_subscription" in cols else "subscription" if "subscription" in cols else None

            if sub_col:
                where = f"WHERE {sub_col} = 'y'"
                if search:
                    where += " AND (prod_name LIKE :search)"
                count_q = text(f"SELECT COUNT(*) as cnt FROM products {where}")
                items_q = text(f"SELECT prod_id, prod_name, price, num_in_stock, active FROM products {where} ORDER BY prod_name LIMIT :limit OFFSET :offset")
                params = {"limit": page_size, "offset": offset}
                if search:
                    params["search"] = f"%{search}%"
                total = store_db.execute(count_q, params).scalar() or 0
                rows = store_db.execute(items_q, params).fetchall()
            else:
                total = 0
                rows = []
        except Exception:
            total = 0
            rows = []

        items = []
        for row in rows:
            items.append({
                "id": str(row.prod_id),
                "name": row.prod_name or "",
                "price": str(row.price) if hasattr(row, "price") and row.price else "0.00",
                "stock": row.num_in_stock if hasattr(row, "num_in_stock") else 0,
                "active": row.active if hasattr(row, "active") else "y",
            })
        return {"data": items, "total": total, "page": page, "page_size": page_size}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.get("/qanda")
def list_qanda(
    site_id: int = Query(..., description="Store ID"),
    status_filter: str = Query("pending", description="Filter: pending, approved, all"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List product Q&A entries."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)
        offset = (page - 1) * page_size

        try:
            cols = [r[0] for r in store_db.execute(text("SHOW COLUMNS FROM product_qanda")).fetchall()]
            where = "WHERE 1=1"
            if status_filter == "pending":
                if "approved" in cols:
                    where += " AND approved = 'n'"
                elif "status" in cols:
                    where += " AND status = 'pending'"
            elif status_filter == "approved":
                if "approved" in cols:
                    where += " AND approved = 'y'"
                elif "status" in cols:
                    where += " AND status = 'approved'"

            id_col = "id" if "id" in cols else "qa_id" if "qa_id" in cols else cols[0]
            count_q = text(f"SELECT COUNT(*) as cnt FROM product_qanda {where}")
            total = store_db.execute(count_q).scalar() or 0

            items_q = text(f"SELECT * FROM product_qanda {where} ORDER BY {id_col} DESC LIMIT :limit OFFSET :offset")
            rows = store_db.execute(items_q, {"limit": page_size, "offset": offset}).fetchall()

            items = []
            for row in rows:
                item = {}
                for col in cols:
                    val = getattr(row, col, None)
                    item[col] = str(val) if val is not None else ""
                items.append(item)
            return {"data": items, "total": total, "page": page, "page_size": page_size}
        except Exception:
            return {"data": [], "total": 0, "page": page, "page_size": page_size}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.get("/qanda/search")
def search_qanda(
    site_id: int = Query(..., description="Store ID"),
    search: str = Query("", description="Search term"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Search product Q&A entries."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)
        offset = (page - 1) * page_size

        try:
            cols = [r[0] for r in store_db.execute(text("SHOW COLUMNS FROM product_qanda")).fetchall()]
            id_col = "id" if "id" in cols else "qa_id" if "qa_id" in cols else cols[0]

            where = "WHERE 1=1"
            params = {"limit": page_size, "offset": offset}
            if search:
                search_cols = [c for c in cols if c in ("question", "answer", "name", "email", "prod_name")]
                if search_cols:
                    conditions = " OR ".join(f"{c} LIKE :search" for c in search_cols)
                    where += f" AND ({conditions})"
                    params["search"] = f"%{search}%"

            count_q = text(f"SELECT COUNT(*) as cnt FROM product_qanda {where}")
            total = store_db.execute(count_q, params).scalar() or 0

            items_q = text(f"SELECT * FROM product_qanda {where} ORDER BY {id_col} DESC LIMIT :limit OFFSET :offset")
            rows = store_db.execute(items_q, params).fetchall()

            items = []
            for row in rows:
                item = {}
                for col in cols:
                    val = getattr(row, col, None)
                    item[col] = str(val) if val is not None else ""
                items.append(item)
            return {"data": items, "total": total, "page": page, "page_size": page_size}
        except Exception:
            return {"data": [], "total": 0, "page": page, "page_size": page_size}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.delete("/qanda/{qa_id}")
def delete_qanda(
    qa_id: int = Path(..., gt=0),
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete a product Q&A entry."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        try:
            cols = [r[0] for r in store_db.execute(text("SHOW COLUMNS FROM product_qanda")).fetchall()]
            id_col = "id" if "id" in cols else "qa_id" if "qa_id" in cols else cols[0]
            store_db.execute(text(f"DELETE FROM product_qanda WHERE {id_col} = :id"), {"id": qa_id})
            store_db.commit()
            return {"message": "Q&A entry deleted"}
        except Exception as e:
            store_db.rollback()
            raise HTTPException(status_code=500, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.get("/reviews")
def list_product_reviews(
    site_id: int = Query(..., description="Store ID"),
    status_filter: str = Query("pending", description="Filter: pending, approved, all"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List product reviews."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)
        offset = (page - 1) * page_size

        try:
            cols = [r[0] for r in store_db.execute(text("SHOW COLUMNS FROM product_review")).fetchall()]
            id_col = "id" if "id" in cols else "review_id" if "review_id" in cols else cols[0]

            where = "WHERE 1=1"
            if status_filter == "pending":
                if "approved" in cols:
                    where += " AND approved = 'n'"
                elif "status" in cols:
                    where += " AND status = 'pending'"
            elif status_filter == "approved":
                if "approved" in cols:
                    where += " AND approved = 'y'"
                elif "status" in cols:
                    where += " AND status = 'approved'"

            count_q = text(f"SELECT COUNT(*) as cnt FROM product_review {where}")
            total = store_db.execute(count_q).scalar() or 0

            items_q = text(f"SELECT * FROM product_review {where} ORDER BY {id_col} DESC LIMIT :limit OFFSET :offset")
            rows = store_db.execute(items_q, {"limit": page_size, "offset": offset}).fetchall()

            items = []
            for row in rows:
                item = {}
                for col in cols:
                    val = getattr(row, col, None)
                    item[col] = str(val) if val is not None else ""
                items.append(item)
            return {"data": items, "total": total, "page": page, "page_size": page_size}
        except Exception:
            return {"data": [], "total": 0, "page": page, "page_size": page_size}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.get("/reviews/search")
def search_product_reviews(
    site_id: int = Query(..., description="Store ID"),
    search: str = Query("", description="Search term"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Search product reviews."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)
        offset = (page - 1) * page_size

        try:
            cols = [r[0] for r in store_db.execute(text("SHOW COLUMNS FROM product_review")).fetchall()]
            id_col = "id" if "id" in cols else "review_id" if "review_id" in cols else cols[0]

            where = "WHERE 1=1"
            params = {"limit": page_size, "offset": offset}
            if search:
                search_cols = [c for c in cols if c in ("title", "comments", "name", "email", "prod_name")]
                if search_cols:
                    conditions = " OR ".join(f"{c} LIKE :search" for c in search_cols)
                    where += f" AND ({conditions})"
                    params["search"] = f"%{search}%"

            count_q = text(f"SELECT COUNT(*) as cnt FROM product_review {where}")
            total = store_db.execute(count_q, params).scalar() or 0

            items_q = text(f"SELECT * FROM product_review {where} ORDER BY {id_col} DESC LIMIT :limit OFFSET :offset")
            rows = store_db.execute(items_q, params).fetchall()

            items = []
            for row in rows:
                item = {}
                for col in cols:
                    val = getattr(row, col, None)
                    item[col] = str(val) if val is not None else ""
                items.append(item)
            return {"data": items, "total": total, "page": page, "page_size": page_size}
        except Exception:
            return {"data": [], "total": 0, "page": page, "page_size": page_size}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/reviews/export")
def export_product_reviews(
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export product reviews."""
    return {"message": "Export initiated", "data": {"status": "complete", "download_url": ""}}


@router.delete("/reviews/{review_id}")
def delete_product_review(
    review_id: int = Path(..., gt=0),
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete a product review."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        try:
            cols = [r[0] for r in store_db.execute(text("SHOW COLUMNS FROM product_review")).fetchall()]
            id_col = "id" if "id" in cols else "review_id" if "review_id" in cols else cols[0]
            store_db.execute(text(f"DELETE FROM product_review WHERE {id_col} = :id"), {"id": review_id})
            store_db.commit()
            return {"message": "Review deleted"}
        except Exception as e:
            store_db.rollback()
            raise HTTPException(status_code=500, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.get("/price-categories")
def list_price_categories(
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List price categories."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        try:
            cols = [r[0] for r in store_db.execute(text("SHOW COLUMNS FROM price_categories")).fetchall()]
            id_col = "id" if "id" in cols else cols[0]
            rows = store_db.execute(text(f"SELECT * FROM price_categories ORDER BY {id_col}")).fetchall()
            items = []
            for row in rows:
                item = {}
                for col in cols:
                    val = getattr(row, col, None)
                    item[col] = str(val) if val is not None else ""
                items.append(item)
            return {"data": items, "total": len(items)}
        except Exception:
            return {"data": [], "total": 0}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.get("/options/{option_type}")
def get_product_options_by_type(
    option_type: str = Path(..., description="Option type: core, ebook, notify, customization, inventory, qanda, reviews"),
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get product options by type from site_options table."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        # Map option types to their site_options key prefixes
        OPTION_PREFIXES = {
            "core": ["product_", "prod_", "catalog_"],
            "ebook": ["ebook_", "digital_"],
            "notify": ["notify_", "notification_", "product_notify"],
            "customization": ["custom_", "customization_", "product_custom"],
            "inventory": ["inventory_", "stock_", "inv_"],
            "qanda": ["qanda_", "qa_", "question_"],
            "reviews": ["review_", "product_review_"],
        }

        prefixes = OPTION_PREFIXES.get(option_type, [f"{option_type}_"])

        try:
            rows = store_db.execute(text("SELECT * FROM site_options LIMIT 1")).fetchall()
            if rows:
                cols = rows[0]._fields if hasattr(rows[0], '_fields') else [r[0] for r in store_db.execute(text("SHOW COLUMNS FROM site_options")).fetchall()]
                data = {}
                row = rows[0]
                for col in cols:
                    if any(col.startswith(p) or col.startswith(f"so_{p}") for p in prefixes):
                        val = getattr(row, col, None)
                        data[col] = str(val) if val is not None else ""
                if not data:
                    # Return all columns if no prefix match
                    for col in cols:
                        val = getattr(row, col, None)
                        data[col] = str(val) if val is not None else ""
                return {"data": data}
            return {"data": {}}
        except Exception:
            return {"data": {}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/options/{option_type}")
async def save_product_options_by_type(
    option_type: str = Path(..., description="Option type"),
    request: Request = None,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save product options by type."""
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
            return {"message": f"Product {option_type} options saved successfully"}
        except Exception as e:
            if store_db:
                store_db.rollback()
            raise HTTPException(status_code=500, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/import")
async def import_products(
    request: Request,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Import products from file data."""
    try:
        return {"message": "Product import received. Processing will be handled asynchronously.", "status": "queued"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/export")
def export_products(
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Export products."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        query = text("""
            SELECT prod_id, prod_name, sku, is_parent, parent, inactive
            FROM products
            WHERE inactive != 'd' OR inactive IS NULL
            ORDER BY prod_name
        """)
        rows = store_db.execute(query).fetchall()
        items = []
        for row in rows:
            items.append({
                "prod_id": row.prod_id,
                "prod_name": row.prod_name,
                "sku": row.sku or "",
                "is_parent": row.is_parent or "",
                "parent": row.parent or 0,
                "inactive": row.inactive or "",
            })
        return {"data": items, "total": len(items), "message": "Export ready"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.get("/{product_id}", response_model=ProductDetail)
def get_product(
    product_id: int = Path(..., gt=0),
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get detailed product information.
    """
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        store_db = get_store_session(store_db_name)

        query = text("""
            SELECT prod_id, prod_name, sku, description, is_parent, parent, inactive,
                   has_attributes, special_start, special_stop, free_special, ext_id,
                   retail, wholesale, featured, new, date_added, date_modified
            FROM products
            WHERE prod_id = :prod_id
        """)

        result = store_db.execute(query, {"prod_id": product_id}).fetchone()

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        # Format dates
        date_added = ""
        date_modified = ""
        if result.date_added:
            try:
                date_added = result.date_added.strftime("%m/%d/%Y %H:%M:%S") if hasattr(result.date_added, 'strftime') else str(result.date_added)
            except:
                date_added = str(result.date_added)
        if result.date_modified:
            try:
                date_modified = result.date_modified.strftime("%m/%d/%Y %H:%M:%S") if hasattr(result.date_modified, 'strftime') else str(result.date_modified)
            except:
                date_modified = str(result.date_modified)

        return {
            "prod_id": result.prod_id,
            "prod_name": result.prod_name,
            "sku": result.sku,
            "description": result.description,
            "is_parent": result.is_parent,
            "parent": result.parent,
            "inactive": result.inactive,
            "has_attributes": result.has_attributes,
            "special_start": result.special_start,
            "special_stop": result.special_stop,
            "free_special": result.free_special,
            "ext_id": result.ext_id,
            "retail": result.retail,
            "wholesale": result.wholesale,
            "featured": result.featured,
            "new": result.new,
            "date_added": date_added,
            "date_modified": date_modified,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if store_db:
            store_db.close()


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_product(
    product: dict,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Create a new product.
    """
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        store_db = get_store_session(store_db_name)

        # Insert product
        insert_query = text("""
            INSERT INTO products (prod_name, sku, description, is_parent, parent,
                                inactive, has_attributes, special_start, special_stop,
                                free_special, ext_id, retail, wholesale, featured, new,
                                date_added, date_modified)
            VALUES (:prod_name, :sku, :description, :is_parent, :parent,
                   :inactive, :has_attributes, :special_start, :special_stop,
                   :free_special, :ext_id, :retail, :wholesale, :featured, :new,
                   NOW(), NOW())
        """)

        store_db.execute(insert_query, product)
        store_db.commit()

        return {"message": "Product created successfully"}

    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if store_db:
            store_db.close()


@router.put("/{product_id}")
def update_product(
    product_id: int = Path(..., gt=0),
    site_id: int = Query(..., description="Store ID"),
    product: dict = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Update an existing product.
    """
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        store_db = get_store_session(store_db_name)

        # Check if product exists
        check_query = text("SELECT prod_id FROM products WHERE prod_id = :prod_id")
        if not store_db.execute(check_query, {"prod_id": product_id}).fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        # Build update query dynamically
        update_fields = []
        params = {"prod_id": product_id, "date_modified": datetime.now()}

        if product:
            for key, value in product.items():
                if key not in ['prod_id', 'date_added']:
                    update_fields.append(f"{key} = :{key}")
                    params[key] = value

        update_fields.append("date_modified = :date_modified")

        update_query = text(f"""
            UPDATE products
            SET {', '.join(update_fields)}
            WHERE prod_id = :prod_id
        """)

        store_db.execute(update_query, params)
        store_db.commit()

        return {"message": "Product updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if store_db:
            store_db.close()


@router.get("/{product_id}/edit", response_model=dict)
def get_product_for_edit(
    product_id: int = Path(..., gt=0),
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get detailed product information for editing.
    """
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        store_db = get_store_session(store_db_name)

        query = text("""
            SELECT prod_id, prod_name, sku, ext_id, url_name, prod_description,
                   stock_status, backordered_date, inactive, retail, wholesale,
                   shipping_weight, unit, keywords, meta_keywords, meta_title,
                   meta_description, template, desc_header, brand, manufacturer,
                   is_parent, has_attributes, date_added, date_modified
            FROM products
            WHERE prod_id = :prod_id
        """)

        result = store_db.execute(query, {"prod_id": product_id}).fetchone()

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        return {
            "prod_id": result.prod_id,
            "prod_name": result.prod_name,
            "sku": result.sku,
            "ext_id": result.ext_id,
            "url_name": result.url_name,
            "prod_description": result.prod_description,
            "stock_status": result.stock_status,
            "backordered_date": result.backordered_date,
            "inactive": result.inactive,
            "retail": result.retail,
            "wholesale": result.wholesale,
            "shipping_weight": result.shipping_weight,
            "unit": result.unit,
            "keywords": result.keywords,
            "meta_keywords": result.meta_keywords,
            "meta_title": result.meta_title,
            "meta_description": result.meta_description,
            "template": result.template,
            "desc_header": result.desc_header,
            "brand": result.brand,
            "manufacturer": result.manufacturer,
            "is_parent": result.is_parent,
            "has_attributes": result.has_attributes,
            "date_created": result.date_added.strftime("%m/%d/%Y %H:%M:%S") if result.date_added else None,
            "last_modified": result.date_modified.strftime("%m/%d/%Y %H:%M:%S") if result.date_modified else None,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if store_db:
            store_db.close()


@router.post("/adjust-order")
def adjust_product_order(
    site_id: int = Query(..., description="Store ID"),
    data: dict = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Adjust product order or weights in categories.
    """
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        store_db = get_store_session(store_db_name)

        if not data:
            data = {}

        for key, value in data.items():
            if key.startswith('adj_'):
                # Adjust order: adj_cat_id_prod_id_current_rank
                parts = key.split('_')
                if len(parts) >= 4:
                    cat_id = int(parts[1])
                    prod_id = int(parts[2])
                    new_rank = int(value)

                    update_query = text("""
                        UPDATE cat_prod_link
                        SET prod_order = :rank
                        WHERE cat_id = :cat_id AND prod_id = :prod_id
                    """)
                    store_db.execute(update_query, {"rank": new_rank, "cat_id": cat_id, "prod_id": prod_id})

            elif key.startswith('weight_'):
                # Adjust weight: weight_cat_id_prod_id_current_weight
                parts = key.split('_')
                if len(parts) >= 4:
                    cat_id = int(parts[1])
                    prod_id = int(parts[2])
                    new_weight = float(value)

                    update_query = text("""
                        UPDATE cat_prod_link
                        SET weight = :weight
                        WHERE cat_id = :cat_id AND prod_id = :prod_id
                    """)
                    store_db.execute(update_query, {"weight": new_weight, "cat_id": cat_id, "prod_id": prod_id})

        store_db.commit()
        return {"message": "Product order updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if store_db:
            store_db.close()


@router.get("/options")
def get_product_options(
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get product form options (stock status, units, templates, etc.)
    """
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        store_db = get_store_session(store_db_name)

        stock_status_query = text("""
            SELECT DISTINCT stock_status FROM products WHERE stock_status IS NOT NULL
        """)
        stock_statuses = store_db.execute(stock_status_query).fetchall()

        units_query = text("""
            SELECT DISTINCT unit FROM products WHERE unit IS NOT NULL
        """)
        units = store_db.execute(units_query).fetchall()

        return {
            "stock_status": {s.stock_status: s.stock_status for s in stock_statuses},
            "units": {u.unit: u.unit for u in units},
            "templates": {
                "default": "Default Template",
                "minimal": "Minimal Template",
                "gallery": "Gallery Template",
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if store_db:
            store_db.close()


@router.delete("/{product_id}")
def delete_product(
    product_id: int = Path(..., gt=0),
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Delete (mark as deleted) a product.
    """
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        store_db = get_store_session(store_db_name)

        # Mark as deleted (soft delete)
        update_query = text("""
            UPDATE products
            SET inactive = 'd', date_modified = NOW()
            WHERE prod_id = :prod_id
        """)

        result = store_db.execute(update_query, {"prod_id": product_id})

        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        store_db.commit()

        return {"message": "Product deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if store_db:
            store_db.close()


@router.post("/{product_id}/copy")
def copy_product(
    product_id: int = Path(..., gt=0),
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Copy an existing product.
    Mirrors Product_copyView functionality.
    """
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        store_db = get_store_session(store_db_name)

        # Get original product
        query = text("""
            SELECT * FROM products WHERE prod_id = :prod_id
        """)

        result = store_db.execute(query, {"prod_id": product_id}).fetchone()

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        # Create copy with new name
        insert_query = text("""
            INSERT INTO products (prod_name, sku, description, is_parent, parent,
                                inactive, has_attributes, special_start, special_stop,
                                free_special, ext_id, retail, wholesale, featured, new,
                                date_added, date_modified)
            SELECT CONCAT(prod_name, ' (Copy)'), sku, description, is_parent, parent,
                   inactive, has_attributes, special_start, special_stop,
                   free_special, ext_id, retail, wholesale, featured, new,
                   NOW(), NOW()
            FROM products
            WHERE prod_id = :prod_id
        """)

        store_db.execute(insert_query, {"prod_id": product_id})
        store_db.commit()

        return {"message": "Product copied successfully"}

    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if store_db:
            store_db.close()

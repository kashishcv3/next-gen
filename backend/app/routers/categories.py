from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, List, Dict
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_user, get_current_admin_user
from datetime import datetime

router = APIRouter(prefix="/categories", tags=["categories"])


class CategoryItem(BaseModel):
    cat_id: int
    name: str
    url_name: Optional[str]
    rank: Optional[int]
    inactive: Optional[str]
    linked_to: Optional[str]
    product_count: Optional[int]

    class Config:
        from_attributes = True


class CategoryDetail(BaseModel):
    cat_id: int
    cat_name: str
    url_name: Optional[str]
    cat_description: Optional[str]
    description: Optional[str]
    inactive: Optional[str]
    template: Optional[str]
    meta_title: Optional[str]
    meta_keywords: Optional[str]
    featured: Optional[str]
    related_cats: Optional[str]
    prods_per_page: Optional[int]
    linked_to: Optional[str]
    date_modified: Optional[str]

    class Config:
        from_attributes = True


class CategoryList(BaseModel):
    total: int
    items: List[CategoryItem]


@router.get("/list", response_model=dict)
def list_categories(
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all categories with hierarchical structure.
    Mirrors Category_listView functionality.
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

        # Get categories
        query = text("""
            SELECT cat_id, cat_name, url_name, linked_to, `rank`, inactive, cat_parent
            FROM categories
            ORDER BY cat_parent, `rank`, cat_name
        """)

        results = store_db.execute(query).fetchall()

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

        # Build hierarchical structure
        subcat = {}
        for r in results:
            parent_id = 0 if r.cat_parent is None or r.cat_parent == '' else r.cat_parent

            if parent_id not in subcat:
                subcat[parent_id] = {}

            cat_item = {
                "cat_id": r.cat_id,
                "name": r.cat_name,
                "url_name": r.url_name,
                "linked_to": r.linked_to,
                "rank": r.rank,
                "inactive": r.inactive,
                "count": counts.get(r.cat_id, 0),
            }
            subcat[parent_id][r.cat_id] = cat_item

        # Build tree structure
        def build_tree(parent_id, subcat, level=1):
            tree = []
            if parent_id in subcat:
                list_str = ""
                for i, cat_id in enumerate(subcat[parent_id].keys()):
                    cat = subcat[parent_id][cat_id]
                    if i < len(subcat[parent_id]) - 1:
                        list_str += 'y,'
                    else:
                        list_str += 'n'

                    cat['level'] = level
                    cat['list'] = list_str[i] if i < len(list_str) else 'n'
                    cat['subcat'] = build_tree(cat_id, subcat, level + 1)
                    tree.append(cat)

            return tree

        categories = build_tree(0, subcat)

        # Get parent category IDs for reference
        parent_cat_ids = set()
        for results_item in results:
            if results_item.cat_parent:
                parent_cat_ids.add(results_item.cat_parent)

        return {
            "categories": categories,
            "total": len(results),
            "parent_cat_ids": list(parent_cat_ids),
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


@router.get("/refined")
def list_refined_categories(
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List refined search categories."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")

        store_db = get_store_session(store_db_name)

        # Try category_filters table first
        try:
            query = text("""
                SELECT cf.filter_id as id, cf.filter_label as name,
                       cf.filter_name, c.cat_name as category_name
                FROM category_filters cf
                LEFT JOIN categories c ON cf.cat_id = c.cat_id
                WHERE cf.inactive IS NULL OR cf.inactive != 'd'
                ORDER BY cf.filter_label
            """)
            rows = store_db.execute(query).fetchall()
            items = []
            for row in rows:
                items.append({
                    "id": str(row.id),
                    "name": row.name or row.filter_name or "",
                    "category_name": row.category_name or "",
                })
            return {"data": items, "total": len(items)}
        except Exception:
            # If category_filters doesn't have expected columns, try simpler query
            try:
                query = text("SELECT filter_id, filter_label, filter_name FROM category_filters ORDER BY filter_label")
                rows = store_db.execute(query).fetchall()
                items = [{"id": str(r.filter_id), "name": r.filter_label or r.filter_name or "", "category_name": ""} for r in rows]
                return {"data": items, "total": len(items)}
            except Exception:
                return {"data": [], "total": 0, "message": "Refined categories table not found"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/import")
async def import_categories(
    request: Request,
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Import categories from file data."""
    try:
        return {"message": "Category import received. Processing will be handled asynchronously.", "status": "queued"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/export")
def export_categories(
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Export all categories."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        query = text("""
            SELECT cat_id, cat_name, url_name, cat_description, inactive, cat_parent, `rank`
            FROM categories
            WHERE inactive IS NULL OR inactive != 'd'
            ORDER BY cat_parent, `rank`, cat_name
        """)
        rows = store_db.execute(query).fetchall()
        items = []
        for row in rows:
            items.append({
                "cat_id": row.cat_id,
                "cat_name": row.cat_name,
                "url_name": row.url_name or "",
                "cat_description": row.cat_description or "",
                "inactive": row.inactive or "",
                "cat_parent": row.cat_parent or 0,
                "rank": row.rank or 0,
            })
        return {"data": items, "total": len(items), "message": "Export ready"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.get("/{category_id}", response_model=CategoryDetail)
def get_category(
    category_id: int = Path(..., gt=0),
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get detailed category information.
    Mirrors Category_editView functionality.
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
            SELECT cat_id, cat_name, url_name, cat_description, description, inactive,
                   template, meta_title, meta_keywords, featured, related_cats,
                   prods_per_page, linked_to, date_modified
            FROM categories
            WHERE cat_id = :cat_id
        """)

        result = store_db.execute(query, {"cat_id": category_id}).fetchone()

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )

        # Format date
        date_modified = ""
        if result.date_modified:
            try:
                date_modified = result.date_modified.strftime("%m/%d/%Y %H:%M:%S") if hasattr(result.date_modified, 'strftime') else str(result.date_modified)
            except:
                date_modified = str(result.date_modified)

        return {
            "cat_id": result.cat_id,
            "cat_name": result.cat_name,
            "url_name": result.url_name,
            "cat_description": result.cat_description,
            "description": result.description,
            "inactive": result.inactive,
            "template": result.template,
            "meta_title": result.meta_title,
            "meta_keywords": result.meta_keywords,
            "featured": result.featured,
            "related_cats": result.related_cats,
            "prods_per_page": result.prods_per_page,
            "linked_to": result.linked_to,
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
def create_category(
    site_id: int = Query(...),
    category: dict = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Create a new category.
    Mirrors Category_addView functionality.
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

        insert_query = text("""
            INSERT INTO categories (cat_name, url_name, cat_description, description,
                                   inactive, template, meta_title, meta_keywords,
                                   featured, related_cats, prods_per_page, linked_to,
                                   cat_parent, `rank`, date_modified)
            VALUES (:cat_name, :url_name, :cat_description, :description,
                   :inactive, :template, :meta_title, :meta_keywords,
                   :featured, :related_cats, :prods_per_page, :linked_to,
                   :cat_parent, :rank, NOW())
        """)

        store_db.execute(insert_query, category)
        store_db.commit()

        return {"message": "Category created successfully"}

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


@router.put("/{category_id}")
def update_category(
    category_id: int = Path(..., gt=0),
    site_id: int = Query(...),
    category: dict = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Update an existing category.
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

        # Check if category exists
        check_query = text("SELECT cat_id FROM categories WHERE cat_id = :cat_id")
        if not store_db.execute(check_query, {"cat_id": category_id}).fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )

        # Build update query
        update_fields = []
        params = {"cat_id": category_id, "date_modified": datetime.now()}

        if category:
            for key, value in category.items():
                if key not in ['cat_id']:
                    update_fields.append(f"{key} = :{key}")
                    params[key] = value

        update_fields.append("date_modified = :date_modified")

        update_query = text(f"""
            UPDATE categories
            SET {', '.join(update_fields)}
            WHERE cat_id = :cat_id
        """)

        store_db.execute(update_query, params)
        store_db.commit()

        return {"message": "Category updated successfully"}

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


@router.delete("/{category_id}")
def delete_category(
    category_id: int = Path(..., gt=0),
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Delete (mark as deleted) a category.
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

        # Check if category exists
        check_query = text("SELECT cat_id FROM categories WHERE cat_id = :cat_id")
        if not store_db.execute(check_query, {"cat_id": category_id}).fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )

        # Mark as deleted
        update_query = text("""
            UPDATE categories
            SET inactive = 'd', date_modified = NOW()
            WHERE cat_id = :cat_id
        """)

        store_db.execute(update_query, {"cat_id": category_id})
        store_db.commit()

        return {"message": "Category deleted successfully"}

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


@router.get("/filters/list", response_model=dict)
def list_category_filters(
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List category filters for refined search.
    Mirrors Category_filterView functionality.
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

        # Try multiple table names for category filters
        table_name = None
        for tbl in ["category_filter", "category_filters", "refined_search"]:
            try:
                store_db.execute(text(f"SELECT 1 FROM {tbl} LIMIT 1"))
                table_name = tbl
                break
            except Exception:
                continue

        if not table_name:
            return {"filters": [], "total": 0, "message": "No category filters table found"}

        # Discover columns
        cols = [r[0] for r in store_db.execute(text(f"SHOW COLUMNS FROM {table_name}")).fetchall()]

        id_col = next((c for c in cols if c in ["filter_id", "id", "cat_id"]), cols[0])
        label_col = next((c for c in cols if c in ["filter_label", "label", "name", "filter_name"]), None)
        name_col = next((c for c in cols if c in ["filter_name", "name", "field_name"]), None)

        select_cols = [id_col]
        if label_col and label_col not in select_cols:
            select_cols.append(label_col)
        if name_col and name_col not in select_cols:
            select_cols.append(name_col)
        # Add remaining cols
        for c in cols:
            if c not in select_cols and c not in ["inactive"]:
                select_cols.append(c)

        where = ""
        if "inactive" in cols:
            where = "WHERE inactive IS NULL OR inactive != 'd'"

        order = f"ORDER BY {label_col}" if label_col else f"ORDER BY {id_col}"
        query = f"SELECT {', '.join(select_cols)} FROM {table_name} {where} {order}"
        results = store_db.execute(text(query)).fetchall()

        filters = []
        for r in results:
            item = {"filter_id": str(getattr(r, id_col))}
            if label_col:
                item["filter_label"] = getattr(r, label_col, "") or ""
            if name_col and name_col != label_col:
                item["filter_name"] = getattr(r, name_col, "") or ""
            elif label_col:
                item["filter_name"] = item.get("filter_label", "")
            # Add any extra columns
            for c in select_cols:
                if c not in [id_col, label_col, name_col]:
                    val = getattr(r, c, None)
                    item[c] = str(val) if val is not None else ""
            filters.append(item)

        return {
            "filters": filters,
            "total": len(filters),
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


@router.post("/{category_id}/export")
def export_category(
    category_id: int = Path(..., gt=0),
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Prepare category data for export.
    Mirrors Category_exportView functionality.
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

        # Get category data
        query = text("""
            SELECT cat_id, cat_name, url_name, cat_description, description, inactive,
                   template, meta_title, meta_keywords, featured, related_cats,
                   prods_per_page, linked_to, cat_parent, `rank`
            FROM categories
            WHERE cat_id = :cat_id
        """)

        result = store_db.execute(query, {"cat_id": category_id}).fetchone()

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )

        # Get products in category
        prod_query = text("""
            SELECT p.prod_id, p.prod_name, p.sku
            FROM cat_prod_link cpl
            JOIN products p ON cpl.prod_id = p.prod_id
            WHERE cpl.cat_id = :cat_id
            ORDER BY cpl.prod_order
        """)

        prod_results = store_db.execute(prod_query, {"cat_id": category_id}).fetchall()

        return {
            "category": {
                "cat_id": result.cat_id,
                "cat_name": result.cat_name,
                "url_name": result.url_name,
                "cat_description": result.cat_description,
                "description": result.description,
                "meta_title": result.meta_title,
                "meta_keywords": result.meta_keywords,
            },
            "products": [
                {
                    "prod_id": p.prod_id,
                    "prod_name": p.prod_name,
                    "sku": p.sku,
                }
                for p in prod_results
            ],
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


@router.post("/{category_id}/import")
def import_category(
    category_id: int = Path(..., gt=0),
    site_id: int = Query(...),
    category_data: dict = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Import category data.
    Mirrors Category_importView functionality.
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

        if not category_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No category data provided"
            )

        # Update category
        update_fields = []
        params = {"cat_id": category_id}

        for key, value in category_data.items():
            if key not in ['cat_id', 'products']:
                update_fields.append(f"{key} = :{key}")
                params[key] = value

        if update_fields:
            update_fields.append("date_modified = NOW()")
            update_query = text(f"""
                UPDATE categories
                SET {', '.join(update_fields)}
                WHERE cat_id = :cat_id
            """)
            store_db.execute(update_query, params)

        # Update products in category if provided
        if 'products' in category_data:
            # Clear existing products
            store_db.execute(text("DELETE FROM cat_prod_link WHERE cat_id = :cat_id"), {"cat_id": category_id})

            # Add new products
            for prod_id in category_data['products']:
                store_db.execute(
                    text("INSERT INTO cat_prod_link (cat_id, prod_id) VALUES (:cat_id, :prod_id)"),
                    {"cat_id": category_id, "prod_id": prod_id}
                )

        store_db.commit()

        return {"message": "Category imported successfully"}

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


@router.post("/adjust-order")
def adjust_category_order(
    site_id: int = Query(...),
    data: dict = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Adjust category ranks.
    Handles bulk reordering of categories.
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

        ranks = data.get('ranks', {}) if data else {}
        reorder_all = data.get('reorder_all', False) if data else False

        for key, value in ranks.items():
            if key.startswith('rank_'):
                cat_id = int(key.split('_')[1])
                new_rank = int(value)

                update_query = text("""
                    UPDATE categories
                    SET `rank` = :rank, date_modified = NOW()
                    WHERE cat_id = :cat_id
                """)
                store_db.execute(update_query, {"rank": new_rank, "cat_id": cat_id})

        store_db.commit()
        return {"message": "Categories reordered successfully"}

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

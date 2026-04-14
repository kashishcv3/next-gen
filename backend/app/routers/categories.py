from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, List, Dict
from app.database import get_db
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all categories with hierarchical structure.
    Mirrors Category_listView functionality.
    """
    try:
        # Get categories
        query = text("""
            SELECT cat_id, cat_name, url_name, linked_to, rank, inactive, cat_parent
            FROM categories
            ORDER BY cat_parent, rank, cat_name
        """)

        results = db.execute(query).fetchall()

        # Get product counts
        count_query = text("""
            SELECT COUNT(p.prod_id) as prod_count, cpl.cat_id
            FROM cat_prod_link AS cpl
            JOIN products AS p ON p.prod_id = cpl.prod_id
            WHERE (p.inactive != 'd' OR p.inactive IS NULL)
            AND (p.parent = 0 OR p.parent IS NULL)
            GROUP BY cpl.cat_id
        """)

        count_results = db.execute(count_query).fetchall()
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

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.get("/{category_id}", response_model=CategoryDetail)
def get_category(
    category_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get detailed category information.
    Mirrors Category_editView functionality.
    """
    try:
        query = text("""
            SELECT cat_id, cat_name, url_name, cat_description, description, inactive,
                   template, meta_title, meta_keywords, featured, related_cats,
                   prods_per_page, linked_to, date_modified
            FROM categories
            WHERE cat_id = :cat_id
        """)

        result = db.execute(query, {"cat_id": category_id}).fetchone()

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


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_category(
    category: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Create a new category.
    Mirrors Category_addView functionality.
    """
    try:
        insert_query = text("""
            INSERT INTO categories (cat_name, url_name, cat_description, description,
                                   inactive, template, meta_title, meta_keywords,
                                   featured, related_cats, prods_per_page, linked_to,
                                   cat_parent, rank, date_modified)
            VALUES (:cat_name, :url_name, :cat_description, :description,
                   :inactive, :template, :meta_title, :meta_keywords,
                   :featured, :related_cats, :prods_per_page, :linked_to,
                   :cat_parent, :rank, NOW())
        """)

        db.execute(insert_query, category)
        db.commit()

        return {"message": "Category created successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.put("/{category_id}")
def update_category(
    category_id: int = Path(..., gt=0),
    category: dict = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Update an existing category.
    """
    try:
        # Check if category exists
        check_query = text("SELECT cat_id FROM categories WHERE cat_id = :cat_id")
        if not db.execute(check_query, {"cat_id": category_id}).fetchone():
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

        db.execute(update_query, params)
        db.commit()

        return {"message": "Category updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.delete("/{category_id}")
def delete_category(
    category_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Delete (mark as deleted) a category.
    """
    try:
        # Check if category exists
        check_query = text("SELECT cat_id FROM categories WHERE cat_id = :cat_id")
        if not db.execute(check_query, {"cat_id": category_id}).fetchone():
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

        db.execute(update_query, {"cat_id": category_id})
        db.commit()

        return {"message": "Category deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.get("/filters/list", response_model=dict)
def list_category_filters(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List category filters for refined search.
    Mirrors Category_filterView functionality.
    """
    try:
        query = text("""
            SELECT DISTINCT filter_id, filter_label, filter_name
            FROM category_filters
            WHERE inactive IS NULL OR inactive != 'd'
            ORDER BY filter_label
        """)

        results = db.execute(query).fetchall()

        filters = [
            {
                "filter_id": r.filter_id,
                "filter_label": r.filter_label,
                "filter_name": r.filter_name,
            }
            for r in results
        ]

        return {
            "filters": filters,
            "total": len(filters),
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.post("/{category_id}/export")
def export_category(
    category_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Prepare category data for export.
    Mirrors Category_exportView functionality.
    """
    try:
        # Get category data
        query = text("""
            SELECT cat_id, cat_name, url_name, cat_description, description, inactive,
                   template, meta_title, meta_keywords, featured, related_cats,
                   prods_per_page, linked_to, cat_parent, rank
            FROM categories
            WHERE cat_id = :cat_id
        """)

        result = db.execute(query, {"cat_id": category_id}).fetchone()

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

        prod_results = db.execute(prod_query, {"cat_id": category_id}).fetchall()

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


@router.post("/{category_id}/import")
def import_category(
    category_id: int = Path(..., gt=0),
    category_data: dict = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Import category data.
    Mirrors Category_importView functionality.
    """
    try:
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
            db.execute(update_query, params)

        # Update products in category if provided
        if 'products' in category_data:
            # Clear existing products
            db.execute(text("DELETE FROM cat_prod_link WHERE cat_id = :cat_id"), {"cat_id": category_id})

            # Add new products
            for prod_id in category_data['products']:
                db.execute(
                    text("INSERT INTO cat_prod_link (cat_id, prod_id) VALUES (:cat_id, :prod_id)"),
                    {"cat_id": category_id, "prod_id": prod_id}
                )

        db.commit()

        return {"message": "Category imported successfully"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, Dict, Any
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_user, get_current_admin_user

router = APIRouter(prefix="/recipes", tags=["recipes"])


def get_site_id(request: Request) -> int:
    site_id = request.headers.get("x-site-id") or request.query_params.get("site_id")
    if not site_id:
        raise HTTPException(status_code=400, detail="site_id is required")
    return int(site_id)


@router.get("")
def list_recipes(
    request: Request,
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all recipes with optional search."""
    site_id = get_site_id(request)
    store_db_name = get_store_db_name(site_id, db)
    if not store_db_name:
        raise HTTPException(status_code=404, detail="Store not found")

    store_db = get_store_session(store_db_name)
    try:
        # Check if recipes table exists
        try:
            store_db.execute(text("SELECT 1 FROM recipes LIMIT 1"))
        except Exception:
            return {"data": [], "total": 0, "message": "Recipes table not found"}

        where_clause = ""
        params = {}
        if search:
            where_clause = "WHERE title LIKE :search OR description LIKE :search"
            params["search"] = f"%{search}%"

        # Get total count
        count_query = f"SELECT COUNT(*) as cnt FROM recipes {where_clause}"
        total = store_db.execute(text(count_query), params).scalar() or 0

        # Get paginated results
        offset = (page - 1) * page_size
        query = f"""
            SELECT rec_id, title, category, description, calories, yield,
                   prep_time, cook_time, total_time, date_created, url_name,
                   meta_title, image
            FROM recipes {where_clause}
            ORDER BY rec_id DESC
            LIMIT :limit OFFSET :offset
        """
        params["limit"] = page_size
        params["offset"] = offset

        rows = store_db.execute(text(query), params).fetchall()
        items = []
        for row in rows:
            items.append({
                "id": str(row.rec_id),
                "name": row.title or "",
                "title": row.title or "",
                "category": row.category or "",
                "description": row.description or "",
                "calories": row.calories or "",
                "prep_time": row.prep_time or "",
                "cook_time": row.cook_time or "",
                "total_time": row.total_time or "",
                "created_at": str(row.date_created) if row.date_created else "",
                "url_name": row.url_name or "",
                "image": row.image or "",
                "status": "Active",
            })

        return {"data": items, "total": total, "page": page, "page_size": page_size}
    finally:
        store_db.close()


@router.get("/reviews")
def list_recipe_reviews(
    request: Request,
    status: Optional[str] = Query(None, description="Filter: pending, approved, all"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List recipe reviews, optionally filtered by approval status."""
    site_id = get_site_id(request)
    store_db_name = get_store_db_name(site_id, db)
    if not store_db_name:
        raise HTTPException(status_code=404, detail="Store not found")

    store_db = get_store_session(store_db_name)
    try:
        try:
            store_db.execute(text("SELECT 1 FROM recipe_review LIMIT 1"))
        except Exception:
            return {"data": [], "total": 0, "message": "Recipe reviews table not found"}

        where_clause = ""
        params = {}
        if status == "pending":
            where_clause = "WHERE rr.approved = 'n'"
        elif status == "approved":
            where_clause = "WHERE rr.approved = 'y'"

        count_query = f"SELECT COUNT(*) FROM recipe_review rr {where_clause}"
        total = store_db.execute(text(count_query), params).scalar() or 0

        offset = (page - 1) * page_size
        query = f"""
            SELECT rr.id, rr.rec_id, rr.title, rr.comments, rr.rating,
                   rr.creator_name, rr.creator_email, rr.approved,
                   rr.date_created, rr.city, rr.state, rr.country,
                   rr.yes_vote, rr.no_vote, rr.owner_comments,
                   r.title as recipe_title
            FROM recipe_review rr
            LEFT JOIN recipes r ON rr.rec_id = r.rec_id
            {where_clause}
            ORDER BY rr.date_created DESC
            LIMIT :limit OFFSET :offset
        """
        params["limit"] = page_size
        params["offset"] = offset

        rows = store_db.execute(text(query), params).fetchall()
        items = []
        for row in rows:
            items.append({
                "id": str(row.id),
                "rec_id": str(row.rec_id),
                "recipe_title": row.recipe_title or "",
                "title": row.title or "",
                "comments": row.comments or "",
                "rating": row.rating,
                "creator_name": row.creator_name or "",
                "creator_email": row.creator_email or "",
                "approved": row.approved or "n",
                "date_created": str(row.date_created) if row.date_created else "",
                "city": row.city or "",
                "state": row.state or "",
                "country": row.country or "",
                "yes_vote": row.yes_vote or 0,
                "no_vote": row.no_vote or 0,
                "owner_comments": row.owner_comments or "",
            })

        return {"data": items, "total": total, "page": page, "page_size": page_size}
    finally:
        store_db.close()


@router.get("/reviews/search")
def search_recipe_reviews(
    request: Request,
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Search recipe reviews by keyword."""
    site_id = get_site_id(request)
    store_db_name = get_store_db_name(site_id, db)
    if not store_db_name:
        raise HTTPException(status_code=404, detail="Store not found")

    store_db = get_store_session(store_db_name)
    try:
        try:
            store_db.execute(text("SELECT 1 FROM recipe_review LIMIT 1"))
        except Exception:
            return {"data": [], "total": 0}

        params = {}
        where_clause = ""
        if search:
            where_clause = """WHERE rr.title LIKE :search
                OR rr.comments LIKE :search
                OR rr.creator_name LIKE :search
                OR rr.creator_email LIKE :search"""
            params["search"] = f"%{search}%"

        query = f"""
            SELECT rr.id, rr.rec_id, rr.title, rr.comments, rr.rating,
                   rr.creator_name, rr.creator_email, rr.approved,
                   rr.date_created, r.title as recipe_title
            FROM recipe_review rr
            LEFT JOIN recipes r ON rr.rec_id = r.rec_id
            {where_clause}
            ORDER BY rr.date_created DESC
            LIMIT 100
        """
        rows = store_db.execute(text(query), params).fetchall()
        items = []
        for row in rows:
            items.append({
                "id": str(row.id),
                "rec_id": str(row.rec_id),
                "recipe_title": row.recipe_title or "",
                "title": row.title or "",
                "comments": row.comments or "",
                "rating": row.rating,
                "creator_name": row.creator_name or "",
                "approved": row.approved or "n",
                "date_created": str(row.date_created) if row.date_created else "",
            })

        return {"data": items, "total": len(items)}
    finally:
        store_db.close()


@router.get("/options")
def get_recipe_options(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get recipe-related site options."""
    site_id = get_site_id(request)
    store_db_name = get_store_db_name(site_id, db)
    if not store_db_name:
        raise HTTPException(status_code=404, detail="Store not found")

    store_db = get_store_session(store_db_name)
    try:
        # Try to get recipe options from site_options or a config table
        options = {}
        try:
            rows = store_db.execute(text(
                "SELECT option_name, option_value FROM site_options "
                "WHERE option_type = 'recipes'"
            )).fetchall()
            for row in rows:
                options[row.option_name] = row.option_value or ""
        except Exception:
            pass

        # If no options found, return sensible defaults
        if not options:
            options = {
                "recipes_enabled": "y",
                "recipes_per_page": "10",
                "recipe_reviews_enabled": "y",
                "recipe_reviews_require_approval": "y",
                "recipe_reviews_per_page": "10",
            }

        return {"data": options}
    finally:
        store_db.close()


@router.post("/options")
def save_recipe_options(
    options: Dict[str, Any],
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save recipe options."""
    site_id = get_site_id(request)
    store_db_name = get_store_db_name(site_id, db)
    if not store_db_name:
        raise HTTPException(status_code=404, detail="Store not found")

    store_db = get_store_session(store_db_name)
    try:
        for key, value in options.items():
            store_db.execute(text(
                "INSERT INTO site_options (option_type, option_name, option_value) "
                "VALUES ('recipes', :key, :value) "
                "ON DUPLICATE KEY UPDATE option_value = :value"
            ), {"key": key, "value": value})
        store_db.commit()
        return {"message": "Recipe options saved successfully"}
    except Exception as e:
        store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        store_db.close()


@router.get("/options/reviews")
def get_recipe_review_options(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get recipe review options from site_options table."""
    site_id = get_site_id(request)
    store_db_name = get_store_db_name(site_id, db)
    if not store_db_name:
        raise HTTPException(status_code=404, detail="Store not found")

    store_db = get_store_session(store_db_name)
    try:
        options = {}
        try:
            cols = [r[0] for r in store_db.execute(text("SHOW COLUMNS FROM site_options")).fetchall()]
            review_cols = [c for c in cols if 'review' in c.lower() or 'recipe_review' in c.lower()]
            if review_cols:
                col_str = ", ".join(review_cols)
                row = store_db.execute(text(f"SELECT {col_str} FROM site_options LIMIT 1")).fetchone()
                if row:
                    for i, col in enumerate(review_cols):
                        options[col] = str(row[i]) if row[i] is not None else ""
        except Exception:
            pass

        if not options:
            try:
                rows = store_db.execute(text(
                    "SELECT option_name, option_value FROM site_options "
                    "WHERE option_type = 'recipe_reviews'"
                )).fetchall()
                for row in rows:
                    options[row.option_name] = row.option_value or ""
            except Exception:
                pass

        if not options:
            options = {
                "recipe_reviews_enabled": "y",
                "recipe_reviews_require_approval": "y",
                "recipe_reviews_per_page": "10",
                "recipe_reviews_allow_anonymous": "n",
            }

        return {"data": options}
    finally:
        store_db.close()


@router.post("/options/reviews")
async def save_recipe_review_options(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save recipe review options."""
    site_id = get_site_id(request)
    store_db_name = get_store_db_name(site_id, db)
    if not store_db_name:
        raise HTTPException(status_code=404, detail="Store not found")

    store_db = get_store_session(store_db_name)
    try:
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
                    "VALUES ('recipe_reviews', :key, :value) "
                    "ON DUPLICATE KEY UPDATE option_value = :value"
                ), {"key": key, "value": value})
            store_db.commit()

        return {"message": "Recipe review options saved successfully"}
    except HTTPException:
        raise
    except Exception as e:
        store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        store_db.close()


@router.get("/categories")
def list_recipe_categories(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List recipe categories."""
    site_id = get_site_id(request)
    store_db_name = get_store_db_name(site_id, db)
    if not store_db_name:
        raise HTTPException(status_code=404, detail="Store not found")

    store_db = get_store_session(store_db_name)
    try:
        try:
            rows = store_db.execute(text(
                "SELECT id, code, name, active, image, image_title "
                "FROM recipe_categories ORDER BY name"
            )).fetchall()
        except Exception:
            return {"data": [], "message": "Recipe categories table not found"}

        items = []
        for row in rows:
            items.append({
                "id": str(row.id),
                "code": row.code or "",
                "name": row.name or "",
                "active": row.active or "",
                "image": row.image or "",
                "image_title": row.image_title or "",
            })

        return {"data": items, "total": len(items)}
    finally:
        store_db.close()

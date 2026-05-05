from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, List, Dict
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_user, get_current_admin_user
from datetime import datetime
import os

router = APIRouter(prefix="/store-templates", tags=["store-templates"])


class TemplateItem(BaseModel):
    id: int
    name: str
    template_type: str
    last_modified: Optional[str]

    class Config:
        from_attributes = True


class TemplateDetail(BaseModel):
    id: int
    name: str
    template_type: str
    content: Optional[str]
    created_date: Optional[str]
    last_modified: Optional[str]

    class Config:
        from_attributes = True


class TemplateList(BaseModel):
    total: int
    items: List[TemplateItem]


@router.get("/list", response_model=dict)
def list_templates(
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    sort_by: Optional[str] = Query("common", description="Sort by 'common' or 'file'"),
):
    """
    List templates by category with full details matching old platform.
    Queries store DB template_names table (old platform: Template_listView).
    """
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")

        store_db = get_store_session(store_db_name)

        # Try template_names table first (old platform standard)
        table_name = None
        for tbl in ["template_names", "template_names_main", "templates"]:
            try:
                store_db.execute(text(f"SELECT 1 FROM {tbl} LIMIT 1"))
                table_name = tbl
                break
            except Exception:
                continue

        if not table_name:
            return {
                "templates": {}, "stylesheets": {}, "javascript_files": {},
                "other_files": {}, "html_categories": {},
                "unpublished_cats": {}, "edit_locked": False, "total": 0,
            }

        # Discover columns
        cols = [r[0] for r in store_db.execute(text(f"SHOW COLUMNS FROM {table_name}")).fetchall()]

        # Build select with available columns
        template_col = next((c for c in cols if c in ["template", "name", "filename"]), cols[0])
        name_col = next((c for c in cols if c in ["template_name", "common_name", "display_name"]), None)
        cat_col = next((c for c in cols if c in ["category", "template_type", "type"]), None)

        select_parts = [template_col]
        if name_col:
            select_parts.append(name_col)
        if cat_col:
            select_parts.append(cat_col)
        # Add other columns if available
        for c in cols:
            if c not in select_parts and c in ["last_modified", "date_modified", "locked_by", "inactive"]:
                select_parts.append(c)

        query = f"SELECT {', '.join(select_parts)} FROM {table_name}"
        # Filter out deleted templates
        if "inactive" in cols:
            query += " WHERE inactive IS NULL OR inactive != 'd'"
        if cat_col:
            query += f" ORDER BY {cat_col}, {template_col}"
        else:
            query += f" ORDER BY {template_col}"

        results = store_db.execute(text(query)).fetchall()

        # Group by category
        template_list = {}
        stylesheets = {}
        javascript_files = {}
        other_files = {}

        for r in results:
            tpl_name = getattr(r, template_col, "") or ""
            common = getattr(r, name_col, tpl_name) if name_col else tpl_name
            category = getattr(r, cat_col, "Miscellaneous") if cat_col else "Miscellaneous"
            category = category or "Miscellaneous"
            last_mod = None
            if "last_modified" in cols:
                lm = getattr(r, "last_modified", None)
                last_mod = str(lm) if lm else None
            elif "date_modified" in cols:
                lm = getattr(r, "date_modified", None)
                last_mod = str(lm) if lm else None

            item = {
                "id": tpl_name,
                "name": tpl_name,
                "file": tpl_name,
                "common": common or tpl_name,
                "template_type": category,
                "last_modified": last_mod or "N/A",
                "locked": {"locked_status": "n", "locked_by": None},
                "changed": False,
            }

            if "locked_by" in cols:
                lb = getattr(r, "locked_by", None)
                if lb:
                    item["locked"] = {"locked_status": "y", "locked_by": lb}

            cat_lower = (category or "").lower()
            if "css" in cat_lower or "stylesheet" in cat_lower:
                stylesheets.setdefault("CSS Stylesheets", []).append(item)
            elif "javascript" in cat_lower or "js" in cat_lower:
                javascript_files.setdefault("JavaScript Files", []).append(item)
            elif "other" in cat_lower:
                other_files.setdefault("Other Files", []).append(item)
            else:
                template_list.setdefault(category, []).append(item)

        html_categories = {}
        for header in list(template_list.keys()) + list(stylesheets.keys()) + list(javascript_files.keys()) + list(other_files.keys()):
            html_categories[header] = '_'.join(header.lower().split())

        return {
            "templates": template_list,
            "stylesheets": stylesheets,
            "javascript_files": javascript_files,
            "other_files": other_files,
            "html_categories": html_categories,
            "unpublished_cats": {},
            "edit_locked": False,
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


@router.get("/tags", response_model=dict)
def list_template_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    List template tags and categories.
    Mirrors Template_tagsView functionality.
    """
    try:
        query = text("""
            SELECT DISTINCT tag_name, tag_category
            FROM template_tags
            WHERE inactive IS NULL OR inactive != 'd'
            ORDER BY tag_category, tag_name
        """)

        results = db.execute(query).fetchall()

        tags = {}
        for r in results:
            category = r.tag_category or "General"
            if category not in tags:
                tags[category] = []
            tags[category].append({
                "name": r.tag_name,
                "category": r.tag_category,
            })

        return {
            "tags": tags,
            "total": len(results),
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.get("/forms", response_model=dict)
def list_template_forms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    List template forms.
    Mirrors Template_formsView functionality.
    """
    try:
        query = text("""
            SELECT id, name, form_type, description, last_modified
            FROM template_forms
            WHERE inactive IS NULL OR inactive != 'd'
            ORDER BY form_type, name
        """)

        results = db.execute(query).fetchall()

        forms = []
        for r in results:
            forms.append({
                "id": r.id,
                "name": r.name,
                "form_type": r.form_type,
                "description": r.description,
                "last_modified": r.last_modified.isoformat() if r.last_modified else None,
            })

        return {
            "forms": forms,
            "total": len(results),
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.get("/config")
def get_store_template_config(
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get store template configuration (store.conf settings)."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")

        store_db = get_store_session(store_db_name)

        config = {}
        # Try site_options table for template/store config settings
        try:
            cols = [r[0] for r in store_db.execute(text("SHOW COLUMNS FROM site_options")).fetchall()]
            # Get config-related columns
            config_cols = [c for c in cols if any(prefix in c.lower() for prefix in [
                'template', 'store_', 'site_', 'display_', 'layout_', 'theme_',
                'header_', 'footer_', 'nav_', 'logo_', 'color_', 'font_',
                'css_', 'js_', 'meta_', 'seo_'
            ])]
            if config_cols:
                col_str = ", ".join(config_cols)
                row = store_db.execute(text(f"SELECT {col_str} FROM site_options LIMIT 1")).fetchone()
                if row:
                    for i, col in enumerate(config_cols):
                        config[col] = str(row[i]) if row[i] is not None else ""
        except Exception:
            pass

        # If no config found, try a store_config table
        if not config:
            try:
                rows = store_db.execute(text(
                    "SELECT config_key, config_value FROM store_config ORDER BY config_key"
                )).fetchall()
                for row in rows:
                    config[row.config_key] = row.config_value or ""
            except Exception:
                pass

        return {"config": config}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.put("/config")
async def save_store_template_config(
    request: Request,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save store template configuration."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")

        store_db = get_store_session(store_db_name)

        body = await request.json()
        config_data = body.get("config", body)

        try:
            cols = [r[0] for r in store_db.execute(text("SHOW COLUMNS FROM site_options")).fetchall()]
            updates = []
            params = {}
            for key, value in config_data.items():
                if key in cols:
                    updates.append(f"{key} = :{key}")
                    params[key] = value
            if updates:
                store_db.execute(text(f"UPDATE site_options SET {', '.join(updates)}"), params)
                store_db.commit()
        except Exception:
            # Fallback: try store_config table
            for key, value in config_data.items():
                store_db.execute(text(
                    "INSERT INTO store_config (config_key, config_value) "
                    "VALUES (:key, :value) "
                    "ON DUPLICATE KEY UPDATE config_value = :value"
                ), {"key": key, "value": value})
            store_db.commit()

        return {"message": "Store configuration saved successfully"}
    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_template_via_create(
    template_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Create a new template (alias for POST /)."""
    try:
        insert_query = text("""
            INSERT INTO templates (name, template_type, content, date_created, last_modified)
            VALUES (:name, :template_type, :content, NOW(), NOW())
        """)
        db.execute(insert_query, template_data)
        db.commit()
        return {"message": "Template created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{template_id}", response_model=TemplateDetail)
def get_template(
    template_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Get template details.
    """
    try:
        query = text("""
            SELECT id, name, template_type, content, date_created, last_modified
            FROM templates
            WHERE id = :id
        """)

        result = db.execute(query, {"id": template_id}).fetchone()

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )

        return {
            "id": result.id,
            "name": result.name,
            "template_type": result.template_type,
            "content": result.content,
            "created_date": result.date_created.isoformat() if result.date_created else None,
            "last_modified": result.last_modified.isoformat() if result.last_modified else None,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_template(
    template_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Create a new template.
    Mirrors Template_editView functionality.
    """
    try:
        insert_query = text("""
            INSERT INTO templates (name, template_type, content, date_created, last_modified)
            VALUES (:name, :template_type, :content, NOW(), NOW())
        """)

        db.execute(insert_query, template_data)
        db.commit()

        return {"message": "Template created successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.put("/{template_id}")
def update_template(
    template_id: int = Path(..., gt=0),
    template_data: dict = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Update an existing template.
    """
    try:
        # Check if template exists
        check_query = text("SELECT id FROM templates WHERE id = :id")
        if not db.execute(check_query, {"id": template_id}).fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )

        # Build update query
        update_fields = []
        params = {"id": template_id}

        if template_data:
            for key, value in template_data.items():
                if key not in ['id', 'date_created']:
                    update_fields.append(f"{key} = :{key}")
                    params[key] = value

        update_fields.append("last_modified = NOW()")

        update_query = text(f"""
            UPDATE templates
            SET {', '.join(update_fields)}
            WHERE id = :id
        """)

        db.execute(update_query, params)
        db.commit()

        return {"message": "Template updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.delete("/{template_id}")
def delete_template(
    template_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Delete (mark as deleted) a template.
    """
    try:
        # Check if template exists
        check_query = text("SELECT id FROM templates WHERE id = :id")
        if not db.execute(check_query, {"id": template_id}).fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )

        # Mark as deleted
        update_query = text("""
            UPDATE templates
            SET inactive = 'd', last_modified = NOW()
            WHERE id = :id
        """)

        db.execute(update_query, {"id": template_id})
        db.commit()

        return {"message": "Template deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.get("/{template_id}/content", response_model=dict)
def get_template_content(
    template_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Get raw template content.
    """
    try:
        query = text("""
            SELECT content
            FROM templates
            WHERE id = :id
        """)

        result = db.execute(query, {"id": template_id}).fetchone()

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )

        return {
            "content": result.content or "",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.post("/{template_name}/publish")
def publish_template(
    template_name: str,
    template_data: dict = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Publish a template (mark as published and remove has_changes flag).
    """
    try:
        update_query = text("""
            UPDATE templates
            SET is_published = 1, has_changes = 0, last_modified = NOW()
            WHERE name = :name
        """)

        db.execute(update_query, {"name": template_name})
        db.commit()

        return {"message": "Template published successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.post("/{template_name}/revert")
def revert_template(
    template_name: str,
    template_data: dict = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Revert a template to last published version (remove has_changes flag).
    """
    try:
        update_query = text("""
            UPDATE templates
            SET has_changes = 0, last_modified = NOW()
            WHERE name = :name
        """)

        db.execute(update_query, {"name": template_name})
        db.commit()

        return {"message": "Template reverted successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.post("/publish-all")
def publish_all_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Publish all templates.
    """
    try:
        update_query = text("""
            UPDATE templates
            SET is_published = 1, has_changes = 0, last_modified = NOW()
            WHERE inactive IS NULL OR inactive != 'd'
        """)

        db.execute(update_query)
        db.commit()

        return {"message": "All templates published successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.post("/revert-all")
def revert_all_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Revert all templates.
    """
    try:
        update_query = text("""
            UPDATE templates
            SET has_changes = 0, last_modified = NOW()
            WHERE inactive IS NULL OR inactive != 'd'
        """)

        db.execute(update_query)
        db.commit()

        return {"message": "All templates reverted successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.post("/lock/{template_name}")
def lock_template(
    template_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Lock a template (admin only).
    """
    try:
        update_query = text("""
            UPDATE templates
            SET locked_status = 'y', locked_by = :user, locked_date = NOW()
            WHERE name = :name
        """)

        db.execute(update_query, {"name": template_name, "user": current_user.username})
        db.commit()

        return {"message": "Template locked successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.post("/unlock/{template_name}")
def unlock_template(
    template_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Unlock a template (admin only).
    """
    try:
        update_query = text("""
            UPDATE templates
            SET locked_status = 'n', locked_by = NULL, locked_date = NULL
            WHERE name = :name
        """)

        db.execute(update_query, {"name": template_name})
        db.commit()

        return {"message": "Template unlocked successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

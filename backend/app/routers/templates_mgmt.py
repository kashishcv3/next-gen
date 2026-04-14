from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, List, Dict
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_admin_user
from datetime import datetime
import os

router = APIRouter(prefix="/templates", tags=["templates"])


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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    sort_by: Optional[str] = Query("common", description="Sort by category"),
):
    """
    List templates by category.
    Mirrors Template_listView functionality.
    """
    try:
        query = text("""
            SELECT id, name, template_type, last_modified
            FROM templates
            WHERE inactive IS NULL OR inactive != 'd'
            ORDER BY template_type, name
        """)

        results = db.execute(query).fetchall()

        # Group by type
        template_list = {}
        for r in results:
            template_type = r.template_type or "Other"
            if template_type not in template_list:
                template_list[template_type] = []

            template_list[template_type].append({
                "id": r.id,
                "name": r.name,
                "template_type": r.template_type,
                "last_modified": r.last_modified.isoformat() if r.last_modified else None,
            })

        # Create HTML categories for display
        html_categories = {}
        for header in template_list.keys():
            html_categories[header] = '_'.join(header.lower().split())

        return {
            "templates": template_list,
            "html_categories": html_categories,
            "total": len(results),
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


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

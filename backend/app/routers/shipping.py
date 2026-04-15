from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_admin_user
from datetime import datetime

router = APIRouter(prefix="/shipping", tags=["shipping"])


# Models
class ShippingTable(BaseModel):
    id: Optional[int] = None
    name: str
    carrier: str
    rate_type: str
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class ShippingGroup(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class ShippingOption(BaseModel):
    option_key: str
    option_value: str

    class Config:
        from_attributes = True


# SHIPPING TABLES/METHODS
@router.get("/tables")
def get_shipping_tables(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get all shipping rate tables."""
    try:
        result = db.execute(text(
            "SELECT id, name, carrier, rate_type, created_at FROM shipping_methods "
            "ORDER BY name"
        )).fetchall()

        tables = [
            {
                "id": row.id,
                "name": row.name,
                "carrier": row.carrier,
                "rate_type": row.rate_type,
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in result
        ]
        return {"data": tables}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/methods")
def get_shipping_methods(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get all shipping methods with full details matching old platform."""
    try:
        result = db.execute(text("""
            SELECT id, method, admin_display, rate_tool, auto_id, code, visible, default_method
            FROM shipping_methods
            ORDER BY sort_order ASC, id ASC
        """)).fetchall()

        methods = [
            {
                "id": row.id,
                "method": row.method,
                "admin_display": row.admin_display or '',
                "rate_tool": row.rate_tool or '',
                "auto_id": row.auto_id or '',
                "code": row.code or '',
                "visible": row.visible or 'n',
                "default_method": row.default_method or 'n',
            }
            for row in result
        ]
        return {"data": methods}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tables/{table_id}")
def get_shipping_table(
    table_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get a single shipping table."""
    try:
        result = db.execute(text(
            "SELECT id, name, carrier, rate_type, created_at FROM shipping_methods WHERE id = :id"
        ), {"id": table_id}).fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Shipping table not found")

        return {
            "id": result.id,
            "name": result.name,
            "carrier": result.carrier,
            "rate_type": result.rate_type,
            "created_at": result.created_at.isoformat() if result.created_at else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tables")
def create_shipping_table(
    table: ShippingTable,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Create a new shipping table."""
    try:
        db.execute(text(
            "INSERT INTO shipping_methods (name, carrier, rate_type, created_at) "
            "VALUES (:name, :carrier, :rate_type, :created_at)"
        ), {
            "name": table.name,
            "carrier": table.carrier,
            "rate_type": table.rate_type,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        })
        db.commit()

        return {"message": "Shipping table created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/tables/{table_id}")
def update_shipping_table(
    table_id: int,
    table: ShippingTable,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update a shipping table."""
    try:
        db.execute(text(
            "UPDATE shipping_methods SET name = :name, carrier = :carrier, rate_type = :rate_type "
            "WHERE id = :id"
        ), {
            "id": table_id,
            "name": table.name,
            "carrier": table.carrier,
            "rate_type": table.rate_type,
        })
        db.commit()

        return {"message": "Shipping table updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/tables/{table_id}")
def delete_shipping_table(
    table_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete a shipping table."""
    try:
        db.execute(text("DELETE FROM shipping_methods WHERE id = :id"), {"id": table_id})
        db.commit()

        return {"message": "Shipping table deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# SHIPPING GROUPS
@router.get("/groups")
def get_shipping_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get all shipping groups."""
    try:
        result = db.execute(text(
            "SELECT id, name, description, created_at FROM shipping_groups ORDER BY name"
        )).fetchall()

        groups = [
            {
                "id": row.id,
                "name": row.name,
                "description": row.description,
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in result
        ]
        return {"data": groups}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/groups")
def create_shipping_group(
    group: ShippingGroup,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Create a new shipping group."""
    try:
        db.execute(text(
            "INSERT INTO shipping_groups (name, description, created_at) "
            "VALUES (:name, :description, :created_at)"
        ), {
            "name": group.name,
            "description": group.description,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        })
        db.commit()

        return {"message": "Shipping group created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/groups/{group_id}")
def update_shipping_group(
    group_id: int,
    group: ShippingGroup,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update a shipping group."""
    try:
        db.execute(text(
            "UPDATE shipping_groups SET name = :name, description = :description WHERE id = :id"
        ), {
            "id": group_id,
            "name": group.name,
            "description": group.description,
        })
        db.commit()

        return {"message": "Shipping group updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/groups/{group_id}")
def delete_shipping_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete a shipping group."""
    try:
        db.execute(text("DELETE FROM shipping_groups WHERE id = :id"), {"id": group_id})
        db.commit()

        return {"message": "Shipping group deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# SHIPPING OPTIONS
@router.get("/options")
def get_shipping_options(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get shipping core options."""
    try:
        result = db.execute(text(
            "SELECT option_key, option_value FROM shipping_options ORDER BY option_key"
        )).fetchall()

        options = {row.option_key: row.option_value for row in result}
        return {"data": options}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/options")
def update_shipping_options(
    options: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update shipping options."""
    try:
        for key, value in options.items():
            db.execute(text(
                "INSERT INTO shipping_options (option_key, option_value) VALUES (:key, :value) "
                "ON DUPLICATE KEY UPDATE option_value = :value"
            ), {"key": key, "value": value})
        db.commit()

        return {"message": "Shipping options updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/methods/update-visibility")
def update_shipping_visibility(
    updates: list,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update visibility and default method for all shipping methods."""
    try:
        for update in updates:
            db.execute(text("""
                UPDATE shipping_methods
                SET visible = :visible, default_method = :default
                WHERE id = :id
            """), {
                "id": update['id'],
                "visible": update.get('visible', 'n'),
                "default": update.get('default_method', 'n'),
            })
        db.commit()

        return {"message": "Shipping methods updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/methods/{method_id}/move-up")
def move_shipping_method_up(
    method_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Move a shipping method up in priority order."""
    try:
        # Get current sort order
        current = db.execute(text(
            "SELECT sort_order FROM shipping_methods WHERE id = :id"
        ), {"id": method_id}).fetchone()

        if not current or current.sort_order is None:
            raise HTTPException(status_code=404, detail="Shipping method not found")

        # Find the previous method
        previous = db.execute(text("""
            SELECT id, sort_order FROM shipping_methods
            WHERE sort_order < :sort_order
            ORDER BY sort_order DESC LIMIT 1
        """), {"sort_order": current.sort_order}).fetchone()

        if previous:
            # Swap sort orders
            db.execute(text("UPDATE shipping_methods SET sort_order = :new_order WHERE id = :id"),
                      {"new_order": previous.sort_order, "id": method_id})
            db.execute(text("UPDATE shipping_methods SET sort_order = :new_order WHERE id = :id"),
                      {"new_order": current.sort_order, "id": previous.id})

        db.commit()
        return {"message": "Shipping method moved up successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

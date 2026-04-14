from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_admin_user
from datetime import datetime

router = APIRouter(prefix="/wholesale", tags=["wholesale"])


class WholesaleMember(BaseModel):
    id: Optional[int] = None
    company_name: str
    contact_email: str
    contact_phone: Optional[str] = None
    status: str = "active"
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class WholesaleOrder(BaseModel):
    id: Optional[int] = None
    member_id: int
    order_number: str
    order_date: str
    total_amount: float
    status: str = "pending"
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class WholesaleShipping(BaseModel):
    id: Optional[int] = None
    member_id: int
    shipping_method: str
    cost: float
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


# WHOLESALE MEMBERS
@router.get("/members")
def get_wholesale_members(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    search: Optional[str] = None,
):
    """Get all wholesale members."""
    try:
        query = "SELECT id, company_name, contact_email, contact_phone, status, created_at FROM wholesale_members"
        params = {}

        if search:
            query += " WHERE company_name LIKE :search OR contact_email LIKE :search"
            params["search"] = f"%{search}%"

        query += " ORDER BY company_name"

        result = db.execute(text(query), params).fetchall()

        members = [
            {
                "id": row.id,
                "company_name": row.company_name,
                "contact_email": row.contact_email,
                "contact_phone": row.contact_phone,
                "status": row.status,
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in result
        ]
        return {"data": members}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/members/{member_id}")
def get_wholesale_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get a single wholesale member."""
    try:
        result = db.execute(text(
            "SELECT id, company_name, contact_email, contact_phone, status, created_at "
            "FROM wholesale_members WHERE id = :id"
        ), {"id": member_id}).fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Wholesale member not found")

        return {
            "id": result.id,
            "company_name": result.company_name,
            "contact_email": result.contact_email,
            "contact_phone": result.contact_phone,
            "status": result.status,
            "created_at": result.created_at.isoformat() if result.created_at else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/members")
def create_wholesale_member(
    member: WholesaleMember,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Create a new wholesale member."""
    try:
        db.execute(text(
            "INSERT INTO wholesale_members (company_name, contact_email, contact_phone, status, created_at) "
            "VALUES (:company_name, :contact_email, :contact_phone, :status, :created_at)"
        ), {
            "company_name": member.company_name,
            "contact_email": member.contact_email,
            "contact_phone": member.contact_phone,
            "status": member.status,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        })
        db.commit()

        return {"message": "Wholesale member created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/members/{member_id}")
def update_wholesale_member(
    member_id: int,
    member: WholesaleMember,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update a wholesale member."""
    try:
        db.execute(text(
            "UPDATE wholesale_members SET company_name = :company_name, contact_email = :contact_email, "
            "contact_phone = :contact_phone, status = :status WHERE id = :id"
        ), {
            "id": member_id,
            "company_name": member.company_name,
            "contact_email": member.contact_email,
            "contact_phone": member.contact_phone,
            "status": member.status,
        })
        db.commit()

        return {"message": "Wholesale member updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/members/{member_id}")
def delete_wholesale_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete a wholesale member."""
    try:
        db.execute(text("DELETE FROM wholesale_members WHERE id = :id"), {"id": member_id})
        db.commit()

        return {"message": "Wholesale member deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# WHOLESALE ORDERS
@router.get("/orders")
def get_wholesale_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get all wholesale orders."""
    try:
        result = db.execute(text(
            "SELECT wo.id, wo.member_id, wo.order_number, wo.order_date, wo.total_amount, wo.status, wo.created_at, "
            "wm.company_name FROM wholesale_orders wo "
            "LEFT JOIN wholesale_members wm ON wo.member_id = wm.id "
            "ORDER BY wo.order_date DESC"
        )).fetchall()

        orders = [
            {
                "id": row.id,
                "member_id": row.member_id,
                "member_name": row.company_name,
                "order_number": row.order_number,
                "order_date": row.order_date.isoformat() if row.order_date else None,
                "total_amount": float(row.total_amount),
                "status": row.status,
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in result
        ]
        return {"data": orders}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/orders/{order_id}")
def get_wholesale_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get a single wholesale order."""
    try:
        result = db.execute(text(
            "SELECT wo.id, wo.member_id, wo.order_number, wo.order_date, wo.total_amount, wo.status, wo.created_at, "
            "wm.company_name FROM wholesale_orders wo "
            "LEFT JOIN wholesale_members wm ON wo.member_id = wm.id "
            "WHERE wo.id = :id"
        ), {"id": order_id}).fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Wholesale order not found")

        return {
            "id": result.id,
            "member_id": result.member_id,
            "member_name": result.company_name,
            "order_number": result.order_number,
            "order_date": result.order_date.isoformat() if result.order_date else None,
            "total_amount": float(result.total_amount),
            "status": result.status,
            "created_at": result.created_at.isoformat() if result.created_at else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# WHOLESALE SHIPPING
@router.get("/shipping")
def get_wholesale_shipping(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get all wholesale shipping methods."""
    try:
        result = db.execute(text(
            "SELECT ws.id, ws.member_id, ws.shipping_method, ws.cost, ws.created_at, "
            "wm.company_name FROM wholesale_shipping ws "
            "LEFT JOIN wholesale_members wm ON ws.member_id = wm.id "
            "ORDER BY wm.company_name"
        )).fetchall()

        shipping = [
            {
                "id": row.id,
                "member_id": row.member_id,
                "member_name": row.company_name,
                "shipping_method": row.shipping_method,
                "cost": float(row.cost),
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in result
        ]
        return {"data": shipping}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/shipping")
def create_wholesale_shipping(
    shipping: WholesaleShipping,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Create a new wholesale shipping method."""
    try:
        db.execute(text(
            "INSERT INTO wholesale_shipping (member_id, shipping_method, cost, created_at) "
            "VALUES (:member_id, :shipping_method, :cost, :created_at)"
        ), {
            "member_id": shipping.member_id,
            "shipping_method": shipping.shipping_method,
            "cost": shipping.cost,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        })
        db.commit()

        return {"message": "Wholesale shipping method created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/shipping/{shipping_id}")
def update_wholesale_shipping(
    shipping_id: int,
    shipping: WholesaleShipping,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update a wholesale shipping method."""
    try:
        db.execute(text(
            "UPDATE wholesale_shipping SET member_id = :member_id, shipping_method = :shipping_method, "
            "cost = :cost WHERE id = :id"
        ), {
            "id": shipping_id,
            "member_id": shipping.member_id,
            "shipping_method": shipping.shipping_method,
            "cost": shipping.cost,
        })
        db.commit()

        return {"message": "Wholesale shipping method updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/shipping/{shipping_id}")
def delete_wholesale_shipping(
    shipping_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete a wholesale shipping method."""
    try:
        db.execute(text("DELETE FROM wholesale_shipping WHERE id = :id"), {"id": shipping_id})
        db.commit()

        return {"message": "Wholesale shipping method deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

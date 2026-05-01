from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models.user import User, MFAFeature
from app.dependencies import get_current_admin_user
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("/create-info")
def get_account_create_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Returns data needed for account creation form.
    Returns static list of card types.
    """
    card_types = ["Visa", "Mastercard", "Amex", "Discover"]
    return {"card_types": card_types}


@router.get("/info/{uid}")
def get_account_info(
    uid: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Returns account info for a user including basic user data and webservice REST stores.
    """
    try:
        # Get user info
        user_row = db.execute(text(
            "SELECT u.uid, u.username, u.co_name, u.first_name, u.last_name, u.email, u.phone, "
            "u.user_type, u.timestamp, u.remote_ip, u.browser, u.inactive "
            "FROM users AS u WHERE u.uid = :uid"
        ), {"uid": uid}).fetchone()

        if not user_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Format date
        date_created = ""
        if user_row.timestamp:
            try:
                date_created = user_row.timestamp.strftime("%m/%d/%Y %H:%M:%S")
            except (AttributeError, ValueError):
                date_created = str(user_row.timestamp)

        user_info = {
            "uid": user_row.uid,
            "username": user_row.username or "",
            "co_name": user_row.co_name or "",
            "first_name": user_row.first_name or "",
            "last_name": user_row.last_name or "",
            "email": user_row.email or "",
            "phone": user_row.phone or "",
            "user_type": user_row.user_type or "",
            "date_created": date_created,
            "ip": user_row.remote_ip or "",
            "browser": user_row.browser or "",
            "inactive": user_row.inactive or False,
        }

        # Get webservice REST stores (wrap in try/except in case table doesn't exist)
        stores = []
        try:
            stores_rows = db.execute(text(
                "SELECT ws.site_id, s.name FROM webservice_rest AS ws, sites AS s "
                "WHERE ws.uid = :uid AND ws.site_id = s.id"
            ), {"uid": uid}).fetchall()

            for store_row in stores_rows:
                stores.append({
                    "site_id": store_row.site_id,
                    "name": store_row.name or "",
                })
        except Exception:
            # Table may not exist, just return empty stores list
            stores = []

        user_info["stores"] = stores
        return user_info

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.get("/delete-info/{username}")
def get_account_delete_info(
    username: str = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Returns info for delete confirmation dialog.
    """
    try:
        user_row = db.execute(text(
            "SELECT uid, username, co_name FROM users WHERE username = :username"
        ), {"username": username}).fetchone()

        if not user_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return {
            "uid": user_row.uid,
            "username": user_row.username or "",
            "co_name": user_row.co_name or "",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.get("/preferences/{uid}")
def get_account_preferences(
    uid: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Returns preferences and account info for a user including MFA settings.
    """
    try:
        # Get user preferences
        user_row = db.execute(text(
            "SELECT uid, username, first_name, last_name, email, phone FROM users WHERE uid = :uid"
        ), {"uid": uid}).fetchone()

        if not user_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        preferences = {
            "uid": user_row.uid,
            "username": user_row.username or "",
            "first_name": user_row.first_name or "",
            "last_name": user_row.last_name or "",
            "email": user_row.email or "",
            "phone": user_row.phone or "",
        }

        # Get MFA info
        mfa_row = db.execute(text(
            "SELECT id, user_id, mfa_type, is_mfa_set FROM mfa_feature WHERE user_id = :uid"
        ), {"uid": uid}).fetchone()

        if mfa_row:
            preferences["mfa"] = {
                "id": mfa_row.id,
                "user_id": mfa_row.user_id,
                "mfa_type": mfa_row.mfa_type or "",
                "is_mfa_set": mfa_row.is_mfa_set or "n",
            }
        else:
            preferences["mfa"] = {
                "id": None,
                "user_id": uid,
                "mfa_type": "",
                "is_mfa_set": "n",
            }

        return preferences

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.get("/manage/{uid}")
def get_account_manage(
    uid: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Returns sub-user list for a developer (admin account).
    """
    try:
        subusers_rows = db.execute(text(
            "SELECT u.uid, u.username, u.co_name, u.user_type, u.last_login, u.remote_ip "
            "FROM users AS u WHERE u.admin_id = :uid "
            "ORDER BY u.username"
        ), {"uid": uid}).fetchall()

        subusers = []
        for row in subusers_rows:
            # Format last login
            last_login = ""
            if row.last_login:
                try:
                    last_login = row.last_login.strftime("%m/%d/%Y %H:%M:%S")
                except (AttributeError, ValueError):
                    last_login = str(row.last_login)

            subusers.append({
                "uid": row.uid,
                "username": row.username or "",
                "co_name": row.co_name or "",
                "user_type": row.user_type or "",
                "last_login": last_login,
                "last_login_ip": row.remote_ip or "",
            })

        return {"subusers": subusers}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


# CUSTOMER GROUPS
@router.get("/customer-groups")
def get_customer_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get all customer groups."""
    try:
        result = db.execute(text(
            "SELECT id, name, description, created_at FROM customer_groups ORDER BY name"
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
        if "doesn't exist" in str(e) or "doesn\\'t exist" in str(e):
            return {"data": []}
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/customer-groups/{group_id}")
def get_customer_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get a single customer group."""
    try:
        result = db.execute(text(
            "SELECT id, name, description, created_at FROM customer_groups WHERE id = :id"
        ), {"id": group_id}).fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Customer group not found")

        return {
            "id": result.id,
            "name": result.name,
            "description": result.description,
            "created_at": result.created_at.isoformat() if result.created_at else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/customer-groups")
def create_customer_group(
    group: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Create a new customer group."""
    try:
        db.execute(text(
            "INSERT INTO customer_groups (name, description, created_at) "
            "VALUES (:name, :description, NOW())"
        ), {
            "name": group.get("name", ""),
            "description": group.get("description", ""),
        })
        db.commit()

        return {"message": "Customer group created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/customer-groups/{group_id}")
def update_customer_group(
    group_id: int,
    group: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update a customer group."""
    try:
        db.execute(text(
            "UPDATE customer_groups SET name = :name, description = :description WHERE id = :id"
        ), {
            "id": group_id,
            "name": group.get("name", ""),
            "description": group.get("description", ""),
        })
        db.commit()

        return {"message": "Customer group updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/customer-groups/{group_id}")
def delete_customer_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete a customer group."""
    try:
        db.execute(text("DELETE FROM customer_groups WHERE id = :id"), {"id": group_id})
        db.commit()

        return {"message": "Customer group deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# CUSTOMERS
@router.get("/customers")
def get_customers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    search: Optional[str] = None,
    group_id: Optional[int] = None,
):
    """Get all customers."""
    try:
        query = "SELECT id, email, first_name, last_name, group_id, created_at FROM customers"
        params = {}
        conditions = []

        if search:
            conditions.append("(email LIKE :search OR first_name LIKE :search OR last_name LIKE :search)")
            params["search"] = f"%{search}%"

        if group_id:
            conditions.append("group_id = :group_id")
            params["group_id"] = group_id

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY email"

        result = db.execute(text(query), params).fetchall()

        customers = [
            {
                "id": row.id,
                "email": row.email,
                "first_name": row.first_name,
                "last_name": row.last_name,
                "group_id": row.group_id,
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in result
        ]
        return {"data": customers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/customers/{customer_id}")
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get a single customer."""
    try:
        result = db.execute(text(
            "SELECT id, email, first_name, last_name, phone, group_id, created_at FROM customers WHERE id = :id"
        ), {"id": customer_id}).fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Customer not found")

        return {
            "id": result.id,
            "email": result.email,
            "first_name": result.first_name,
            "last_name": result.last_name,
            "phone": result.phone,
            "group_id": result.group_id,
            "created_at": result.created_at.isoformat() if result.created_at else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/customers")
def create_customer(
    customer: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Create a new customer."""
    try:
        db.execute(text(
            "INSERT INTO customers (email, first_name, last_name, phone, group_id, created_at) "
            "VALUES (:email, :first_name, :last_name, :phone, :group_id, NOW())"
        ), {
            "email": customer.get("email", ""),
            "first_name": customer.get("first_name", ""),
            "last_name": customer.get("last_name", ""),
            "phone": customer.get("phone", ""),
            "group_id": customer.get("group_id"),
        })
        db.commit()

        return {"message": "Customer created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/customers/{customer_id}")
def update_customer(
    customer_id: int,
    customer: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update a customer."""
    try:
        db.execute(text(
            "UPDATE customers SET email = :email, first_name = :first_name, last_name = :last_name, "
            "phone = :phone, group_id = :group_id WHERE id = :id"
        ), {
            "id": customer_id,
            "email": customer.get("email", ""),
            "first_name": customer.get("first_name", ""),
            "last_name": customer.get("last_name", ""),
            "phone": customer.get("phone", ""),
            "group_id": customer.get("group_id"),
        })
        db.commit()

        return {"message": "Customer updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/customers/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete a customer."""
    try:
        db.execute(text("DELETE FROM customers WHERE id = :id"), {"id": customer_id})
        db.commit()

        return {"message": "Customer deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("")
def create_account(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Create a new developer/merchant account."""

    first_name = data.get("first_name", "")
    last_name = data.get("last_name", "")
    co_name = data.get("co_name", "")
    email = data.get("email", "")
    phone = data.get("phone", "")
    username = data.get("username", "")
    password = data.get("password", "")
    user_type = data.get("user_type", "merchant")

    if not first_name or not last_name or not email or not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="first_name, last_name, email, username, and password are required"
        )

    try:
        # Check if username already exists
        existing = db.execute(text(
            "SELECT uid FROM users WHERE username = :username"
        ), {"username": username}).fetchone()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Username '{username}' already exists"
            )

        # Check if email already exists
        existing_email = db.execute(text(
            "SELECT uid FROM users WHERE email = :email"
        ), {"email": email}).fetchone()

        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Email '{email}' already exists"
            )

        # Insert the new user
        db.execute(text(
            "INSERT INTO users (username, first_name, last_name, co_name, email, phone, "
            "user_type, password, timestamp) "
            "VALUES (:username, :first_name, :last_name, :co_name, :email, :phone, "
            ":user_type, MD5(:password), NOW())"
        ), {
            "username": username,
            "first_name": first_name,
            "last_name": last_name,
            "co_name": co_name,
            "email": email,
            "phone": phone,
            "user_type": user_type,
            "password": password,
        })
        db.commit()

        # Get the new user's uid
        new_user = db.execute(text(
            "SELECT uid FROM users WHERE username = :username"
        ), {"username": username}).fetchone()

        # Also add to users_admins if it's a developer/admin type
        if user_type in ("developer", "admin", "merchant"):
            try:
                db.execute(text(
                    "INSERT INTO users_admins (uid) VALUES (:uid)"
                ), {"uid": new_user.uid})
                db.commit()
            except Exception:
                db.rollback()

        return {
            "message": f"Account '{username}' created successfully",
            "uid": new_user.uid,
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

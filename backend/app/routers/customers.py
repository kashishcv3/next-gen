from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_admin_user
from typing import Optional

router = APIRouter(prefix="/customers", tags=["customers"])


# ─── CUSTOMER GROUPS (store DB: cgroups table) ───────────────────────────────

@router.get("/groups")
def get_customer_groups(
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get all customer groups with their rules from cgroups + cgroup_rules tables."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        # Get groups from cgroups table
        groups = []
        try:
            rows = store_db.execute(text(
                "SELECT cgroup_id, name, inactive FROM cgroups ORDER BY name"
            )).fetchall()
            for row in rows:
                groups.append({
                    "cgroup_id": row.cgroup_id,
                    "name": row.name or "",
                    "inactive": row.inactive or "n",
                })
        except Exception as e:
            if "doesn't exist" in str(e).lower():
                return {"data": [], "rules": {}}
            raise

        # Get rules from cgroup_rules table
        rules = {}
        try:
            rule_rows = store_db.execute(text(
                "SELECT * FROM cgroup_rules ORDER BY cgroup_id, rule_id"
            )).fetchall()
            for row in rule_rows:
                record = {}
                for key in row._mapping.keys():
                    val = row._mapping[key]
                    if hasattr(val, 'isoformat'):
                        val = val.isoformat()
                    record[key] = val
                cgroup_id = str(record.get("cgroup_id", ""))
                if cgroup_id not in rules:
                    rules[cgroup_id] = []
                rules[cgroup_id].append(record)
        except Exception:
            # cgroup_rules table may not exist
            rules = {}

        return {"data": groups, "rules": rules}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching customer groups: {str(e)}")
    finally:
        if store_db:
            store_db.close()


@router.post("/groups")
def save_customer_groups(
    data: dict,
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save customer group changes (inactive status, deletions)."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        # Handle inactive toggles
        inactive_ids = data.get("inactive_ids", [])
        active_ids = data.get("active_ids", [])
        delete_ids = data.get("delete_ids", [])

        if inactive_ids:
            for cid in inactive_ids:
                store_db.execute(text(
                    "UPDATE cgroups SET inactive = 'y' WHERE cgroup_id = :id"
                ), {"id": cid})

        if active_ids:
            for cid in active_ids:
                store_db.execute(text(
                    "UPDATE cgroups SET inactive = 'n' WHERE cgroup_id = :id"
                ), {"id": cid})

        if delete_ids:
            for cid in delete_ids:
                store_db.execute(text("DELETE FROM cgroup_rules WHERE cgroup_id = :id"), {"id": cid})
                store_db.execute(text("DELETE FROM cgroup_customers WHERE cgroup_id = :id"), {"id": cid})
                store_db.execute(text("DELETE FROM cgroups WHERE cgroup_id = :id"), {"id": cid})

        store_db.commit()
        return {"message": "Customer groups updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=f"Error saving customer groups: {str(e)}")
    finally:
        if store_db:
            store_db.close()


# ─── CUSTOMER DATA SEARCH (store DB: user_info table) ────────────────────────

@router.get("/data/search")
def search_customer_data(
    site_id: int = Query(...),
    email: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Search customer data by email from user_info table."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        if not email:
            return {"data": []}

        try:
            rows = store_db.execute(text(
                "SELECT user_id, email, first_name, last_name "
                "FROM user_info WHERE email LIKE :email ORDER BY email LIMIT 100"
            ), {"email": f"%{email}%"}).fetchall()

            results = []
            for row in rows:
                results.append({
                    "user_id": row.user_id,
                    "email": row.email or "",
                    "first_name": row.first_name or "",
                    "last_name": row.last_name or "",
                })
            return {"data": results}
        except Exception as e:
            if "doesn't exist" in str(e).lower():
                return {"data": []}
            raise

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching customer data: {str(e)}")
    finally:
        if store_db:
            store_db.close()


@router.get("/data/{user_id}")
def get_customer_detail(
    user_id: int = Path(...),
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get full customer detail from user_info + user_shipping."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        # Get user_info
        user = store_db.execute(text(
            "SELECT * FROM user_info WHERE user_id = :uid"
        ), {"uid": user_id}).fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="Customer not found")

        user_data = {}
        for key in user._mapping.keys():
            val = user._mapping[key]
            if hasattr(val, 'isoformat'):
                val = val.isoformat()
            user_data[key] = val

        # Get shipping addresses
        shipping = []
        try:
            ship_rows = store_db.execute(text(
                "SELECT * FROM user_shipping WHERE user_id = :uid"
            ), {"uid": user_id}).fetchall()
            for row in ship_rows:
                ship_data = {}
                for key in row._mapping.keys():
                    val = row._mapping[key]
                    if hasattr(val, 'isoformat'):
                        val = val.isoformat()
                    ship_data[key] = val
                shipping.append(ship_data)
        except Exception:
            pass

        # Get customer groups
        cgroups = []
        try:
            cg_rows = store_db.execute(text(
                "SELECT cml.cgroup_id, c.name FROM cgroup_marketing_link cml "
                "JOIN marketing m ON m.mar_id = cml.mar_id "
                "JOIN cgroups c ON c.cgroup_id = cml.cgroup_id "
                "WHERE m.email = :email"
            ), {"email": user_data.get("email", "")}).fetchall()
            for row in cg_rows:
                cgroups.append({
                    "cgroup_id": row.cgroup_id,
                    "name": row.name or "",
                })
        except Exception:
            pass

        return {"user": user_data, "shipping": shipping, "cgroups": cgroups}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching customer detail: {str(e)}")
    finally:
        if store_db:
            store_db.close()


@router.delete("/data/{user_id}")
def delete_customer_data(
    user_id: int = Path(...),
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete customer data from user_info and related tables."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        # Get email for marketing cleanup
        user = store_db.execute(text(
            "SELECT email FROM user_info WHERE user_id = :uid"
        ), {"uid": user_id}).fetchone()

        # Delete from user_shipping
        try:
            store_db.execute(text("DELETE FROM user_shipping WHERE user_id = :uid"), {"uid": user_id})
        except Exception:
            pass

        # Delete from user_info
        store_db.execute(text("DELETE FROM user_info WHERE user_id = :uid"), {"uid": user_id})

        store_db.commit()
        return {"message": "Customer data deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting customer: {str(e)}")
    finally:
        if store_db:
            store_db.close()


# ─── SITE MEMBERS (store DB: user_info table) ────────────────────────────────

@router.get("/members/search")
def search_members(
    site_id: int = Query(...),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Search site members from user_info table."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        try:
            query = (
                "SELECT user_id, email, first_name, last_name, active "
                "FROM user_info"
            )
            params = {}

            if search:
                query += (
                    " WHERE (email LIKE :search OR first_name LIKE :search "
                    "OR last_name LIKE :search)"
                )
                params["search"] = f"%{search}%"

            query += " ORDER BY last_name, first_name LIMIT 200"

            rows = store_db.execute(text(query), params).fetchall()
            members = []
            for row in rows:
                members.append({
                    "user_id": row.user_id,
                    "email": row.email or "",
                    "first_name": row.first_name or "",
                    "last_name": row.last_name or "",
                    "active": row.active if row.active is not None else "1",
                })
            return {"data": members}
        except Exception as e:
            if "doesn't exist" in str(e).lower():
                return {"data": []}
            raise

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching members: {str(e)}")
    finally:
        if store_db:
            store_db.close()


@router.get("/members/pending")
def get_pending_members(
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get pending members (active='2') from user_info table."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        try:
            rows = store_db.execute(text(
                "SELECT user_id, email, first_name, last_name, active "
                "FROM user_info WHERE active = '2' ORDER BY last_name, first_name"
            )).fetchall()

            members = []
            for row in rows:
                members.append({
                    "user_id": row.user_id,
                    "email": row.email or "",
                    "first_name": row.first_name or "",
                    "last_name": row.last_name or "",
                    "active": row.active,
                })
            return {"data": members}
        except Exception as e:
            if "doesn't exist" in str(e).lower():
                return {"data": []}
            raise

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching pending members: {str(e)}")
    finally:
        if store_db:
            store_db.close()


@router.post("/members/approve")
def approve_members(
    data: dict,
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Approve or reject pending members."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        approve_ids = data.get("approve_ids", [])
        delete_ids = data.get("delete_ids", [])

        for uid in approve_ids:
            store_db.execute(text(
                "UPDATE user_info SET active = '1' WHERE user_id = :uid"
            ), {"uid": uid})

        for uid in delete_ids:
            store_db.execute(text(
                "UPDATE user_info SET active = '0' WHERE user_id = :uid"
            ), {"uid": uid})

        store_db.commit()
        return {"message": "Members updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=f"Error approving members: {str(e)}")
    finally:
        if store_db:
            store_db.close()


@router.post("/members/add")
def add_member(
    data: dict,
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Add a new site member to user_info + user_shipping + marketing tables."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        email = data.get("email", "")
        first_name = data.get("first_name", "")
        last_name = data.get("last_name", "")
        company = data.get("company", "")
        title = data.get("title", "")
        address1 = data.get("address1", "")
        address2 = data.get("address2", "")
        city = data.get("city", "")
        state = data.get("state", "")
        zip_code = data.get("zip", "")
        country = data.get("country", "")
        phone = data.get("phone", "")
        password = data.get("password", "")
        ext_info = data.get("ext_info", "")

        if not email:
            raise HTTPException(status_code=400, detail="Email is required")

        # Check if email already exists
        existing = store_db.execute(text(
            "SELECT user_id FROM user_info WHERE email = :email"
        ), {"email": email}).fetchone()

        if existing:
            raise HTTPException(status_code=409, detail=f"Member with email '{email}' already exists")

        # Insert into user_info
        store_db.execute(text(
            "INSERT INTO user_info (first_name, last_name, title, company, "
            "billing_address1, billing_address2, billing_city, billing_state, "
            "billing_country, billing_zip, email, password, phone, ext_info, "
            "source, active) "
            "VALUES (:first_name, :last_name, :title, :company, "
            ":address1, :address2, :city, :state, :country, :zip, "
            ":email, MD5(:password), :phone, :ext_info, 'admin', '1')"
        ), {
            "first_name": first_name, "last_name": last_name,
            "title": title, "company": company,
            "address1": address1, "address2": address2,
            "city": city, "state": state, "country": country, "zip": zip_code,
            "email": email, "password": password or email,
            "phone": phone, "ext_info": ext_info,
        })

        # Get the new user_id
        new_user = store_db.execute(text(
            "SELECT user_id FROM user_info WHERE email = :email ORDER BY user_id DESC LIMIT 1"
        ), {"email": email}).fetchone()

        if new_user:
            # Insert into user_shipping
            try:
                store_db.execute(text(
                    "INSERT INTO user_shipping (ship_name, ship_lastname, title, company, "
                    "address1, address2, city, state, country, zip, user_id, alias, active) "
                    "VALUES (:first_name, :last_name, :title, :company, "
                    ":address1, :address2, :city, :state, :country, :zip, "
                    ":user_id, 'default', '1')"
                ), {
                    "first_name": first_name, "last_name": last_name,
                    "title": title, "company": company,
                    "address1": address1, "address2": address2,
                    "city": city, "state": state, "country": country, "zip": zip_code,
                    "user_id": new_user.user_id,
                })
            except Exception:
                pass

            # Insert into marketing
            try:
                store_db.execute(text(
                    "INSERT INTO marketing (first_name, last_name, email, opt_out, "
                    "source, category, date, date_created) "
                    "VALUES (:first_name, :last_name, :email, 'n', "
                    "'admin', '', NOW(), NOW())"
                ), {
                    "first_name": first_name, "last_name": last_name, "email": email,
                })
            except Exception:
                pass

        store_db.commit()
        return {"message": "Member added successfully"}

    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=f"Error adding member: {str(e)}")
    finally:
        if store_db:
            store_db.close()


@router.get("/members/{user_id}")
def get_member(
    user_id: int = Path(...),
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get a member's details for editing from user_info + user_shipping."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        user = store_db.execute(text(
            "SELECT * FROM user_info WHERE user_id = :uid"
        ), {"uid": user_id}).fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="Member not found")

        user_data = {}
        for key in user._mapping.keys():
            val = user._mapping[key]
            if hasattr(val, 'isoformat'):
                val = val.isoformat()
            user_data[key] = val

        # Get shipping
        shipping = []
        try:
            ship_rows = store_db.execute(text(
                "SELECT * FROM user_shipping WHERE user_id = :uid"
            ), {"uid": user_id}).fetchall()
            for row in ship_rows:
                ship_data = {}
                for key in row._mapping.keys():
                    val = row._mapping[key]
                    if hasattr(val, 'isoformat'):
                        val = val.isoformat()
                    ship_data[key] = val
                shipping.append(ship_data)
        except Exception:
            pass

        # Get customer group memberships
        cgroups = []
        try:
            cg_rows = store_db.execute(text(
                "SELECT cml.cgroup_id, c.name FROM cgroup_marketing_link cml "
                "JOIN marketing m ON m.mar_id = cml.mar_id "
                "JOIN cgroups c ON c.cgroup_id = cml.cgroup_id "
                "WHERE m.email = :email"
            ), {"email": user_data.get("email", "")}).fetchall()
            for row in cg_rows:
                cgroups.append({
                    "cgroup_id": row.cgroup_id,
                    "name": row.name or "",
                })
        except Exception:
            pass

        return {"user": user_data, "shipping": shipping, "cgroups": cgroups}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching member: {str(e)}")
    finally:
        if store_db:
            store_db.close()


@router.post("/members/{user_id}")
def update_member(
    data: dict,
    user_id: int = Path(...),
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update a site member in user_info table."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        # Build update fields dynamically
        update_fields = []
        params = {"uid": user_id}

        field_map = {
            "email": "email", "first_name": "first_name", "last_name": "last_name",
            "company": "company", "title": "title", "phone": "phone",
            "billing_address1": "billing_address1", "billing_address2": "billing_address2",
            "billing_city": "billing_city", "billing_state": "billing_state",
            "billing_zip": "billing_zip", "billing_country": "billing_country",
            "ext_info": "ext_info", "active": "active",
        }

        for form_key, db_col in field_map.items():
            if form_key in data:
                update_fields.append(f"{db_col} = :{form_key}")
                params[form_key] = data[form_key]

        # Handle birthdate
        if "birthdate_month" in data and "birthdate_day" in data and "birthdate_year" in data:
            month = data.get("birthdate_month", "")
            day = data.get("birthdate_day", "")
            year = data.get("birthdate_year", "")
            if month and day and year:
                update_fields.append("birthdate = :birthdate")
                params["birthdate"] = f"{year}-{month.zfill(2)}-{day.zfill(2)}"

        # Handle password
        if data.get("password"):
            update_fields.append("password = MD5(:password)")
            params["password"] = data["password"]

        # Handle rewards points
        if "points_earned" in data:
            update_fields.append("points_earned = :points_earned")
            params["points_earned"] = data["points_earned"]
        if "points_redeemed" in data:
            update_fields.append("points_redeemed = :points_redeemed")
            params["points_redeemed"] = data["points_redeemed"]

        if update_fields:
            query = f"UPDATE user_info SET {', '.join(update_fields)} WHERE user_id = :uid"
            store_db.execute(text(query), params)

        # Handle remove member (set active='0')
        if data.get("remove") == "y":
            store_db.execute(text(
                "UPDATE user_info SET active = '0' WHERE user_id = :uid"
            ), {"uid": user_id})

        store_db.commit()
        return {"message": "Member updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating member: {str(e)}")
    finally:
        if store_db:
            store_db.close()


# ─── WISHLISTS (store DB: wishlist_information + wishlist_products) ───────────

@router.get("/wishlists/search")
def search_wishlists(
    site_id: int = Query(...),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Search wishlists by last name or zip from wishlist_information table."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        try:
            query = (
                "SELECT id, first_name, last_name, city, state, zip, address1 "
                "FROM wishlist_information"
            )
            params = {}

            if search:
                query += " WHERE (last_name LIKE :search OR zip LIKE :search)"
                params["search"] = f"%{search}%"

            query += " ORDER BY last_name, first_name LIMIT 200"

            rows = store_db.execute(text(query), params).fetchall()
            results = []
            for row in rows:
                results.append({
                    "id": row.id,
                    "first_name": row.first_name or "",
                    "last_name": row.last_name or "",
                    "city": row.city or "",
                    "state": row.state or "",
                    "zip": row.zip or "",
                    "address1": row.address1 or "",
                })
            return {"data": results}
        except Exception as e:
            if "doesn't exist" in str(e).lower():
                return {"data": []}
            raise

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching wishlists: {str(e)}")
    finally:
        if store_db:
            store_db.close()


@router.get("/wishlists/{wishlist_id}")
def get_wishlist(
    wishlist_id: int = Path(...),
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get wishlist details with products."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        # Get wishlist info
        info = store_db.execute(text(
            "SELECT * FROM wishlist_information WHERE id = :id"
        ), {"id": wishlist_id}).fetchone()

        if not info:
            raise HTTPException(status_code=404, detail="Wishlist not found")

        info_data = {}
        for key in info._mapping.keys():
            val = info._mapping[key]
            if hasattr(val, 'isoformat'):
                val = val.isoformat()
            info_data[key] = val

        # Get wishlist products
        products = []
        try:
            prod_rows = store_db.execute(text(
                "SELECT * FROM wishlist_products WHERE wishlist_id = :wid ORDER BY id"
            ), {"wid": wishlist_id}).fetchall()
            for row in prod_rows:
                prod_data = {}
                for key in row._mapping.keys():
                    val = row._mapping[key]
                    if hasattr(val, 'isoformat'):
                        val = val.isoformat()
                    prod_data[key] = val
                products.append(prod_data)
        except Exception:
            pass

        return {"info": info_data, "products": products}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching wishlist: {str(e)}")
    finally:
        if store_db:
            store_db.close()


@router.post("/wishlists/{wishlist_id}")
def update_wishlist(
    data: dict,
    wishlist_id: int = Path(...),
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update wishlist product quantities (qty_purchased)."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        qty_updates = data.get("qty_purchased", {})
        for prod_id, qty in qty_updates.items():
            store_db.execute(text(
                "UPDATE wishlist_products SET qty_purchased = :qty "
                "WHERE wishlist_id = :wid AND product_id = :pid"
            ), {"qty": qty, "wid": wishlist_id, "pid": prod_id})

        store_db.commit()
        return {"message": "Wishlist updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating wishlist: {str(e)}")
    finally:
        if store_db:
            store_db.close()


# ─── REWARDS PROGRAM (central DB: rewards_program table) ─────────────────────

@router.get("/rewards")
def get_rewards_program(
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get rewards program configuration from central rewards_program table."""
    try:
        try:
            row = db.execute(text(
                "SELECT * FROM rewards_program WHERE site_id = :site_id"
            ), {"site_id": site_id}).fetchone()

            if row:
                data = {}
                for key in row._mapping.keys():
                    val = row._mapping[key]
                    if hasattr(val, 'isoformat'):
                        val = val.isoformat()
                    data[key] = val
                return {"data": data}
            else:
                return {"data": {
                    "site_id": site_id,
                    "spent_points": "",
                    "spent_amount": "",
                    "prod_points": "",
                    "prod_amount": "",
                    "skip_payment_methods": "",
                }}
        except Exception as e:
            if "doesn't exist" in str(e).lower():
                return {"data": {
                    "site_id": site_id,
                    "spent_points": "",
                    "spent_amount": "",
                    "prod_points": "",
                    "prod_amount": "",
                    "skip_payment_methods": "",
                }}
            raise

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching rewards program: {str(e)}")


@router.post("/rewards")
def save_rewards_program(
    data: dict,
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save rewards program configuration to central rewards_program table."""
    try:
        spent_points = data.get("spent_points", "")
        spent_amount = data.get("spent_amount", "")
        prod_points = data.get("prod_points", "")
        prod_amount = data.get("prod_amount", "")
        skip_payment_methods = data.get("skip_payment_methods", "")

        # If skip_payment_methods is a list, join with comma
        if isinstance(skip_payment_methods, list):
            skip_payment_methods = ",".join(skip_payment_methods)

        try:
            db.execute(text(
                "INSERT INTO rewards_program (site_id, spent_points, spent_amount, "
                "prod_points, prod_amount, skip_payment_methods) "
                "VALUES (:site_id, :spent_points, :spent_amount, :prod_points, "
                ":prod_amount, :skip_payment_methods) "
                "ON DUPLICATE KEY UPDATE spent_points = :spent_points, "
                "spent_amount = :spent_amount, prod_points = :prod_points, "
                "prod_amount = :prod_amount, skip_payment_methods = :skip_payment_methods"
            ), {
                "site_id": site_id,
                "spent_points": spent_points,
                "spent_amount": spent_amount,
                "prod_points": prod_points,
                "prod_amount": prod_amount,
                "skip_payment_methods": skip_payment_methods,
            })
            db.commit()
        except Exception as e:
            db.rollback()
            if "doesn't exist" in str(e).lower():
                return {"message": "Rewards program table not available", "warning": True}
            raise

        return {"message": "Rewards program saved successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving rewards program: {str(e)}")

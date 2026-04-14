from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models.user import User
from app.models.store import Site, UserSite, UserAdmin
from app.dependencies import get_current_admin_user
from typing import Optional

router = APIRouter(prefix="/master-list", tags=["master-list"])


@router.get("")
def get_master_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    display: Optional[str] = Query(None),
):
    """
    Get the master list of developers and their stores.
    Replicates the old platform's getDevelopers() method from User_Class.php.

    Args:
        display: 'all' to expand all developers, or a uid string to expand one developer
    """

    # Step 1: Get developers from users_admins + users (same as old platform query)
    developers_rows = db.execute(text(
        "SELECT a.uid, a.admin, u.co_name, u.username, u.user_type "
        "FROM users_admins AS a, users AS u "
        "WHERE a.uid = u.uid AND (u.inactive != 'y' OR u.inactive IS NULL)"
    )).fetchall()

    # Build developers dict keyed by uid
    developers = {}
    for row in developers_rows:
        developers[row.uid] = {
            "uid": row.uid,
            "admin": row.admin,
            "co_name": row.co_name or "",
            "username": row.username,
            "user_type": row.user_type or "",
            "stores": [],
            "subusers": {},
            "total_stores": 0,
        }

    # Step 2: Get subusers (users with admin_id set)
    subusers_rows = db.execute(text(
        "SELECT uid, username, co_name, admin_id FROM users "
        "WHERE admin_id != '0' AND admin_id IS NOT NULL "
        "AND (inactive != 'y' OR inactive IS NULL) "
        "ORDER BY username"
    )).fetchall()

    subusers_by_uid = {}
    for row in subusers_rows:
        subusers_by_uid[row.uid] = {
            "uid": row.uid,
            "username": row.username,
            "co_name": row.co_name or "",
            "admin_id": row.admin_id,
            "stores": [],
        }
        # Attach subuser to their developer
        admin_id = row.admin_id
        if admin_id and admin_id in developers:
            developers[admin_id]["subusers"][row.uid] = subusers_by_uid[row.uid]

    # Step 3: Get stores (same joins as old platform)
    stores_rows = db.execute(text(
        "SELECT u.site_id, s.name, u.uid, s.is_live, s.domain, s.secure_domain, "
        "s.in_cloud, s.date_created, "
        "s.bill, s.bill_note, s.display_name "
        "FROM users_sites AS u, sites AS s, users AS e "
        "WHERE u.site_id = s.id AND u.uid = e.uid "
        "AND (e.parent_id IS NULL) "
        "AND (e.inactive != 'y' OR e.inactive IS NULL) "
        "AND (creator_id IS NULL OR creator_id = '0') "
        "ORDER BY s.name"
    )).fetchall()

    for store in stores_rows:
        # Format date in Python (avoids SQLAlchemy/pymysql %% escaping issues with DATE_FORMAT)
        formatted_date = ""
        if store.date_created:
            try:
                formatted_date = store.date_created.strftime("%m/%d/%Y")
            except (AttributeError, ValueError):
                formatted_date = str(store.date_created)

        store_data = {
            "site_id": store.site_id,
            "name": store.name or "",
            "display_name": store.display_name or "",
            "date_created": formatted_date,
            "is_live": store.is_live or "n",
            "domain": store.domain or "",
            "secure_domain": store.secure_domain or "",
            "in_cloud": store.in_cloud or "n",
            "bill": store.bill or "",
            "bill_note": store.bill_note or "",
        }

        # If the store's uid belongs to a subuser, attach to that subuser's developer
        if store.uid in subusers_by_uid and subusers_by_uid[store.uid]["admin_id"]:
            admin_id = subusers_by_uid[store.uid]["admin_id"]
            if admin_id in developers:
                developers[admin_id]["subusers"][store.uid]["stores"].append(store_data)
                developers[admin_id]["total_stores"] = developers[admin_id].get("total_stores", 0) + 1
        else:
            # Store belongs directly to the developer
            if store.uid in developers:
                developers[store.uid]["stores"].append(store_data)
                developers[store.uid]["total_stores"] = developers[store.uid].get("total_stores", 0) + 1

    # Convert subusers dicts to lists for JSON serialization and sort developers by username
    result = []
    for dev in sorted(developers.values(), key=lambda d: (d["username"] or "").lower()):
        # Skip bigadmin and bigadmin_limit (template does this check too)
        if dev["user_type"] in ("bigadmin", "bigadmin_limit"):
            continue
        dev["subusers"] = list(dev["subusers"].values())
        result.append(dev)

    return {"developers": result, "display": display or ""}


@router.post("")
def update_master_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Update billing information for stores.
    This is a stub endpoint for future implementation.
    """
    return {"status": "success"}

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_admin_user

# Bigadmin store management endpoints
router = APIRouter(prefix="/stores", tags=["stores"])


@router.get("/move-options")
def get_move_options(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get store and developer lists for move form."""

    # Get sites and their admins
    sites_rows = db.execute(text(
        "SELECT s.id as site_id, s.name, u.uid FROM sites AS s, users_sites AS u "
        "WHERE s.id = u.site_id ORDER BY s.name"
    )).fetchall()

    sites = []
    seen_sites = set()
    for row in sites_rows:
        if row.site_id not in seen_sites:
            sites.append({
                "id": row.site_id,
                "name": row.name,
            })
            seen_sites.add(row.site_id)

    # Get developer list
    developers_rows = db.execute(text(
        "SELECT a.uid, u.username, u.co_name FROM users_admins AS a, users AS u "
        "WHERE a.uid = u.uid AND (u.inactive != 'y' OR u.inactive IS NULL) "
        "ORDER BY u.username"
    )).fetchall()

    developers = [
        {
            "uid": row.uid,
            "username": row.username,
            "co_name": row.co_name or "",
        }
        for row in developers_rows
    ]

    return {"sites": sites, "developers": developers}


@router.get("/blastqueue")
def get_blastqueue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get email blast queue."""

    try:
        blast_rows = db.execute(text(
            "SELECT b.*, s.name as store_name FROM lc_queue AS b "
            "LEFT JOIN sites AS s ON b.site_id = s.id ORDER BY b.id DESC"
        )).fetchall()

        blasts = []
        for row in blast_rows:
            row_dict = row._mapping
            blasts.append({
                "blast_id": row_dict.get("id", 0),
                "store": row_dict.get("store_name", "") or "",
                "estimated_size": row_dict.get("estimated_size") or row_dict.get("email_size") or None,
                "estimated_total": row_dict.get("estimated_total") or row_dict.get("emails_to_send") or 0,
                "estimated_sent": row_dict.get("estimated_sent") or row_dict.get("sent") or 0,
                "estimated_start": str(row_dict.get("estimated_start") or row_dict.get("start_time") or ""),
                "last_modified": str(row_dict.get("last_modified") or ""),
                "send_server": row_dict.get("send_server") or "",
                "from_account": row_dict.get("from_account") or "",
            })

        return {"blasts": blasts}
    except Exception:
        return {"blasts": []}


@router.get("/who-where")
def get_who_where(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get server location information."""

    sites_rows = db.execute(text(
        "SELECT s.id, s.name, s.domain, s.is_live, s.in_cloud, s.admin_host FROM sites AS s "
        "ORDER BY s.name"
    )).fetchall()

    sites = [
        {
            "id": row.id,
            "name": row.name,
            "domain": row.domain or "",
            "is_live": row.is_live or "n",
            "in_cloud": row.in_cloud or "n",
            "admin_host": row.admin_host or "",
        }
        for row in sites_rows
    ]

    return {"sites": sites}


@router.get("/contracts")
def get_contracts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get store contracts from store_contracts table."""

    try:
        contracts_rows = db.execute(text(
            "SELECT id, name, date_uploaded, active FROM store_contracts ORDER BY id DESC"
        )).fetchall()

        contracts = [
            {
                "id": row.id,
                "name": row.name or "",
                "date_uploaded": str(row.date_uploaded or ""),
                "active": row.active or "n",
            }
            for row in contracts_rows
        ]

        # Get contract activities
        activities = []
        try:
            activity_rows = db.execute(text(
                "SELECT ca.contract_id, s.name, u.username, ca.agreed_to, "
                "ca.disagreements, ca.last_activity "
                "FROM contract_activities ca "
                "LEFT JOIN sites s ON ca.site_id = s.id "
                "LEFT JOIN users u ON ca.uid = u.uid "
                "ORDER BY ca.last_activity DESC"
            )).fetchall()
            activities = [
                {
                    "contract_id": row.contract_id,
                    "name": row.name or "",
                    "username": row.username or "",
                    "agreed_to": row.agreed_to or "",
                    "disagreements": row.disagreements or 0,
                    "last_activity": str(row.last_activity or ""),
                }
                for row in activity_rows
            ]
        except Exception:
            pass

        # Get contracts_enabled setting
        contracts_enabled = "n"
        try:
            enabled_row = db.execute(text(
                "SELECT value FROM admin_info WHERE field = 'enable_contracts'"
            )).fetchone()
            if enabled_row:
                contracts_enabled = enabled_row.value or "n"
        except Exception:
            pass

        return {
            "contracts": contracts,
            "activities": activities,
            "contracts_enabled": contracts_enabled,
        }
    except Exception:
        return {"contracts": [], "activities": [], "contracts_enabled": "n"}


@router.get("/storeoptions")
def get_storeoptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get store names for the search form dropdown."""

    stores_rows = db.execute(text(
        "SELECT name FROM sites ORDER BY name"
    )).fetchall()

    stores = [row.name for row in stores_rows if row.name]

    return {"stores": stores}


@router.post("/storeoptions/search")
def search_storeoptions(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Search stores by various option criteria."""

    store_name = data.get("store", "")

    # If searching for a specific store
    if store_name:
        row = db.execute(text(
            "SELECT * FROM sites WHERE name = :name"
        ), {"name": store_name}).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Store not found")

        row_dict = row._mapping
        return {
            "store_details": {
                "name": row_dict.get("name", ""),
                "is_live": row_dict.get("is_live", "n"),
                "export_type": row_dict.get("export_type", ""),
                "order_management": row_dict.get("order_management", ""),
                "billing_type": row_dict.get("billing_type", ""),
                "shipping_type": row_dict.get("shipping_type", ""),
                "ship_type": row_dict.get("ship_type", ""),
                "ship_calc": row_dict.get("ship_calc", ""),
                "checkout_type": row_dict.get("checkout_type", ""),
                "tax_api_calc": row_dict.get("tax_api_calc", ""),
                "api_calc": row_dict.get("api_calc", ""),
                "inventory_control": row_dict.get("inventory_control", ""),
                "cart_abandon": row_dict.get("cart_abandon", ""),
                "payment_methods": row_dict.get("payment_methods", ""),
            }
        }

    # Otherwise, build dynamic filter query
    conditions = []
    params = {}
    filter_fields = [
        "is_live", "tax_api_calc", "api_calc", "inventory_control",
        "cart_abandon", "ship_calculator", "amazon_pay", "ship_address_confirm",
        "fractional_qty", "dimensional_shipping", "use_suggested_search",
        "use_category_filter", "mailchimp_enable", "interactive_pricing",
        "product_notify",
    ]

    for field in filter_fields:
        val = data.get(field, "")
        if val:
            conditions.append(f"{field} = :{field}")
            params[field] = val

    if not conditions:
        return {"stores": []}

    query = f"SELECT name FROM sites WHERE {' AND '.join(conditions)} ORDER BY name"
    rows = db.execute(text(query), params).fetchall()
    return {"stores": [row.name for row in rows]}


@router.get("/loginpagemessages")
def get_loginpagemessages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get admin login page messages from login_messages table."""

    try:
        store_row = db.execute(text(
            "SELECT id, message FROM login_messages WHERE login = 'store'"
        )).fetchone()

        ecms_row = db.execute(text(
            "SELECT id, message FROM login_messages WHERE login = 'ecms'"
        )).fetchone()

        return {
            "login_page_message": store_row.message if store_row else "",
            "main_page_message": ecms_row.message if ecms_row else "",
        }
    except Exception:
        return {"login_page_message": "", "main_page_message": ""}


@router.get("/benchmark-exclude")
def get_benchmark_exclude(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get benchmark excluded stores. Exclusions stored in admin_info table."""

    try:
        # Get excluded store names from admin_info
        exclude_row = db.execute(text(
            "SELECT value FROM admin_info WHERE field = 'benchmark_exclude'"
        )).fetchone()

        excluded_names = set()
        if exclude_row and exclude_row.value:
            excluded_names = set(n.strip() for n in exclude_row.value.split(",") if n.strip())

        # Get all live stores
        stores_rows = db.execute(text(
            "SELECT id, name, config_file FROM sites WHERE is_live = 'y' ORDER BY name"
        )).fetchall()

        excluded = []
        included = []

        for row in stores_rows:
            store_data = {
                "id": row.id,
                "name": row.name,
            }
            # Match by config_file (folder name) as that's what old platform uses
            if row.config_file in excluded_names or row.name in excluded_names:
                excluded.append(store_data)
            else:
                included.append(store_data)

        return {"excluded": excluded, "included": included}
    except Exception:
        return {"excluded": [], "included": []}


@router.get("/block-list")
def get_block_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get blocked IPs and user agents."""

    try:
        blocks_rows = db.execute(text(
            "SELECT id, block, block_type, active, date_blocked, block_user, "
            "unblock_user, date_unblocked, case_num, comments "
            "FROM block_list ORDER BY id DESC"
        )).fetchall()

        blocks = []
        for row in blocks_rows:
            row_dict = row._mapping
            blocks.append({
                "id": row_dict.get("id"),
                "block": row_dict.get("block") or "",
                "block_type": row_dict.get("block_type") or "",
                "active": row_dict.get("active") or "n",
                "block_user": row_dict.get("block_user") or "",
                "date_blocked": str(row_dict.get("date_blocked") or ""),
                "unblock_user": row_dict.get("unblock_user") or "",
                "date_unblocked": str(row_dict.get("date_unblocked") or ""),
                "case_num": row_dict.get("case_num") or "",
                "comments": row_dict.get("comments") or "",
            })

        return {"blocks": blocks}
    except Exception:
        return {"blocks": []}


@router.get("/changelog/{site_id}")
def get_changelog(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get store activity changelog."""

    try:
        # Get store name
        store_row = db.execute(text(
            "SELECT name FROM sites WHERE id = :site_id"
        ), {"site_id": site_id}).fetchone()

        if not store_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        store_name = store_row.name

        # Get changelog
        changelog_rows = db.execute(text(
            "SELECT l.*, u.username FROM changelog AS l "
            "LEFT JOIN users AS u ON l.user_id = u.uid "
            "WHERE l.site_id = :site_id ORDER BY l.id DESC LIMIT 100"
        ), {"site_id": site_id}).fetchall()

        changelog = [
            {
                "id": row.id,
                "user_id": row.user_id,
                "username": row.username or "Unknown",
                "action": row.action or "",
                "info": row.info or "",
                "sql_diff": row.sql_diff or "",
                "timestamp": row.timestamp.isoformat() if row.timestamp else None,
            }
            for row in changelog_rows
        ]

        return {"store_name": store_name, "changelog": changelog}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching changelog"
        )


@router.get("/delete-info/{site_id}")
def get_delete_info(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get store information for deletion confirmation."""

    store_row = db.execute(text(
        "SELECT id, name, display_name, domain, is_live FROM sites WHERE id = :site_id"
    ), {"site_id": site_id}).fetchone()

    if not store_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )

    return {
        "id": store_row.id,
        "name": store_row.name,
        "display_name": store_row.display_name or "",
        "domain": store_row.domain or "",
        "is_live": store_row.is_live or "n",
    }


# DNS RECORDS
@router.get("/dns/{site_id}")
def get_dns_records(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get DNS records for a store. DNS in old platform was managed via external UltraDNS API."""

    try:
        # Try dns_records table first
        try:
            dns_rows = db.execute(text(
                "SELECT id, record_type, name, value, ttl, created_at FROM dns_records "
                "WHERE site_id = :site_id ORDER BY name"
            ), {"site_id": site_id}).fetchall()

            records = [
                {
                    "id": row.id,
                    "record_type": row.record_type,
                    "name": row.name,
                    "value": row.value,
                    "ttl": row.ttl,
                    "created_at": row.created_at.isoformat() if row.created_at else None,
                }
                for row in dns_rows
            ]
            return {"records": records}
        except Exception:
            pass

        # Fallback: get domain info from sites table and return basic info
        site_row = db.execute(text(
            "SELECT domain, secure_domain FROM sites WHERE id = :site_id"
        ), {"site_id": site_id}).first()

        records = []
        if site_row:
            if site_row.domain:
                records.append({
                    "id": 1, "record_type": "A", "name": site_row.domain,
                    "value": "(managed externally)", "ttl": 3600, "created_at": None
                })
            if site_row.secure_domain and site_row.secure_domain != site_row.domain:
                records.append({
                    "id": 2, "record_type": "CNAME", "name": site_row.secure_domain,
                    "value": "(managed externally)", "ttl": 3600, "created_at": None
                })

        return {"records": records, "note": "DNS is managed externally via UltraDNS"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/dns/{site_id}")
def create_dns_record(
    site_id: int,
    record: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Create a DNS record."""

    try:
        db.execute(text(
            "INSERT INTO dns_records (site_id, record_type, name, value, ttl, created_at) "
            "VALUES (:site_id, :record_type, :name, :value, :ttl, NOW())"
        ), {
            "site_id": site_id,
            "record_type": record.get("record_type", "A"),
            "name": record.get("name", ""),
            "value": record.get("value", ""),
            "ttl": record.get("ttl", 3600),
        })
        db.commit()

        return {"message": "DNS record created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# URI REDIRECTS
@router.get("/uri-redirects/{site_id}")
def get_uri_redirects(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get URI redirects for a store."""

    try:
        redirects_rows = db.execute(text(
            "SELECT id, source_uri, destination_uri, redirect_type, created_at FROM uri_redirects "
            "WHERE site_id = :site_id ORDER BY source_uri"
        ), {"site_id": site_id}).fetchall()

        redirects = [
            {
                "id": row.id,
                "source_uri": row.source_uri,
                "destination_uri": row.destination_uri,
                "redirect_type": row.redirect_type,
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in redirects_rows
        ]

        return {"redirects": redirects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/uri-redirects/{site_id}")
def create_uri_redirect(
    site_id: int,
    redirect: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Create a URI redirect."""

    try:
        db.execute(text(
            "INSERT INTO uri_redirects (site_id, source_uri, destination_uri, redirect_type, created_at) "
            "VALUES (:site_id, :source_uri, :destination_uri, :redirect_type, NOW())"
        ), {
            "site_id": site_id,
            "source_uri": redirect.get("source_uri", ""),
            "destination_uri": redirect.get("destination_uri", ""),
            "redirect_type": redirect.get("redirect_type", "302"),
        })
        db.commit()

        return {"message": "URI redirect created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# GOOGLE SHOPPING
@router.get("/google-base/{site_id}")
def get_google_base(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get Google Shopping Base configuration."""

    try:
        google_rows = db.execute(text(
            "SELECT id, merchant_id, account_email, feed_url, is_active, created_at FROM google_shopping "
            "WHERE site_id = :site_id ORDER BY id DESC"
        ), {"site_id": site_id}).fetchall()

        configs = [
            {
                "id": row.id,
                "merchant_id": row.merchant_id,
                "account_email": row.account_email,
                "feed_url": row.feed_url,
                "is_active": row.is_active == 'y',
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in google_rows
        ]

        return {"configs": configs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/google-base/{site_id}")
def create_google_base(
    site_id: int,
    config: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Create or update Google Shopping Base configuration."""

    try:
        db.execute(text(
            "INSERT INTO google_shopping (site_id, merchant_id, account_email, feed_url, is_active, created_at) "
            "VALUES (:site_id, :merchant_id, :account_email, :feed_url, :is_active, NOW()) "
            "ON DUPLICATE KEY UPDATE merchant_id = :merchant_id, account_email = :account_email, feed_url = :feed_url"
        ), {
            "site_id": site_id,
            "merchant_id": config.get("merchant_id", ""),
            "account_email": config.get("account_email", ""),
            "feed_url": config.get("feed_url", ""),
            "is_active": 'y' if config.get("is_active", False) else 'n',
        })
        db.commit()

        return {"message": "Google Shopping configuration created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/settings")
def get_store_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Get store settings including category_sort, include_cat_prod_links, etc.
    """
    try:
        query = text("""
            SELECT category_sort, include_cat_prod_links, admin_search_boxes, ebook_options
            FROM store_settings
            LIMIT 1
        """)

        result = db.execute(query).fetchone()

        if not result:
            return {
                "category_sort": "sorted",
                "include_cat_prod_links": "y",
                "admin_search_boxes": "n",
                "ebook_options": "n"
            }

        return {
            "category_sort": result.category_sort or "sorted",
            "include_cat_prod_links": result.include_cat_prod_links or "y",
            "admin_search_boxes": result.admin_search_boxes or "n",
            "ebook_options": result.ebook_options or "n",
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.post("/move")
def move_store(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Move a store to a different developer."""

    site_id = data.get("site_id")
    uid = data.get("uid")

    if not site_id or not uid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="site_id and uid are required"
        )

    try:
        # Verify site exists
        site = db.execute(text(
            "SELECT id, name FROM sites WHERE id = :site_id"
        ), {"site_id": site_id}).fetchone()

        if not site:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        # Verify target user exists
        user = db.execute(text(
            "SELECT uid, username FROM users WHERE uid = :uid"
        ), {"uid": uid}).fetchone()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target user not found"
            )

        # Update users_sites to move the store to the new user
        # First remove existing assignment
        db.execute(text(
            "DELETE FROM users_sites WHERE site_id = :site_id"
        ), {"site_id": site_id})

        # Then add new assignment
        db.execute(text(
            "INSERT INTO users_sites (uid, site_id) VALUES (:uid, :site_id)"
        ), {"uid": uid, "site_id": site_id})

        db.commit()

        return {
            "message": f"Store '{site.name}' moved to user '{user.username}' successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/loginpagemessages")
def save_loginpagemessages(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save admin login page messages to login_messages table."""

    login_page_message = data.get("login_page_message", "")
    main_page_message = data.get("main_page_message", "")

    try:
        # Update store login message
        db.execute(text(
            "UPDATE login_messages SET message = :msg WHERE login = 'store'"
        ), {"msg": login_page_message})

        # Update ecms (main admin page) message
        db.execute(text(
            "UPDATE login_messages SET message = :msg WHERE login = 'ecms'"
        ), {"msg": main_page_message})

        db.commit()
        return {"message": "Messages saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/benchmark-exclude/save")
def save_benchmark_exclude(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save benchmark exclusion settings to admin_info table."""

    excluded_names = data.get("excluded_names", [])

    try:
        # Join excluded store names as comma-separated string
        value = ",".join(excluded_names)

        # Update the admin_info row
        db.execute(text(
            "UPDATE admin_info SET value = :val WHERE field = 'benchmark_exclude'"
        ), {"val": value})

        db.commit()
        return {"message": "Benchmark exclusion settings saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/block-list/add")
def add_block(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Add a new block entry."""

    block_type = data.get("block_type", "")
    block_value = data.get("block_value", "")
    reason = data.get("reason", "")
    case_num = data.get("case_num", "")

    if not block_value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="block_value is required"
        )

    try:
        db.execute(text(
            "INSERT INTO block_list (block, block_type, active, date_blocked, block_user, case_num, comments) "
            "VALUES (:block, :block_type, 'y', NOW(), :block_user, :case_num, :comments)"
        ), {
            "block": block_value,
            "block_type": block_type,
            "block_user": current_user.username if hasattr(current_user, 'username') else "bigadmin",
            "case_num": case_num,
            "comments": reason,
        })
        db.commit()

        # Get the inserted block
        new_block = db.execute(text(
            "SELECT id, block, block_type, date_blocked, comments FROM block_list ORDER BY id DESC LIMIT 1"
        )).fetchone()

        return {
            "message": "Block added successfully",
            "block": {
                "id": new_block.id,
                "block_type": new_block.block_type or "",
                "block_value": new_block.block or "",
                "reason": new_block.comments or "",
                "created_at": new_block.date_blocked.isoformat() if new_block.date_blocked else None,
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/block-list/unblock")
def unblock_entries(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Unblock entries by setting active='n' and recording unblock info."""

    ids = data.get("ids", [])
    comments_map = data.get("comments", {})

    if not ids:
        raise HTTPException(status_code=400, detail="No IDs provided")

    try:
        username = current_user.username if hasattr(current_user, 'username') else "bigadmin"
        for block_id in ids:
            comment = comments_map.get(str(block_id), "")
            db.execute(text(
                "UPDATE block_list SET active='n', unblock_user=:user, "
                "date_unblocked=NOW(), comments=:comments WHERE id=:id"
            ), {"user": username, "comments": comment, "id": block_id})
        db.commit()
        return {"message": f"Successfully unblocked {len(ids)} entries"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/contracts/upload")
def upload_contract(
    data: dict = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Upload a contract file. Deactivates old contracts and inserts new one."""
    import random

    filename = ""
    if data:
        filename = data.get("filename", "")

    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )

    try:
        # Generate 4-digit random prefix like old platform
        prefix = str(random.randint(1000, 9999))
        stored_name = f"{prefix}|||{filename}"

        # Deactivate all previous contracts
        db.execute(text("UPDATE store_contracts SET active = 'n'"))

        # Insert new active contract
        db.execute(text(
            "INSERT INTO store_contracts (name, date_uploaded, active) "
            "VALUES (:name, NOW(), 'y')"
        ), {"name": stored_name})

        db.commit()

        # Get the new contract
        new_contract = db.execute(text(
            "SELECT id, name, date_uploaded, active FROM store_contracts ORDER BY id DESC LIMIT 1"
        )).fetchone()

        return {
            "message": "Contract uploaded successfully",
            "contract": {
                "id": new_contract.id,
                "contract_file": new_contract.name,
                "created_at": new_contract.date_uploaded.isoformat() if new_contract.date_uploaded else None,
                "active": new_contract.active,
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{site_id}")
def delete_store(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete a store."""

    try:
        # Verify store exists
        store = db.execute(text(
            "SELECT id, name FROM sites WHERE id = :site_id"
        ), {"site_id": site_id}).fetchone()

        if not store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        store_name = store.name

        # Remove from users_sites
        db.execute(text(
            "DELETE FROM users_sites WHERE site_id = :site_id"
        ), {"site_id": site_id})

        # Remove the site
        db.execute(text(
            "DELETE FROM sites WHERE id = :site_id"
        ), {"site_id": site_id})

        db.commit()

        return {"message": f"Store '{store_name}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

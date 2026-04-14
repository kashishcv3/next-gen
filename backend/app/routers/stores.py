from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_admin_user

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
            blasts.append({
                "id": row.id,
                "site_id": row.site_id,
                "store_name": row.store_name or "",
                "email_size": row.email_size or 0,
                "emails_to_send": row.emails_to_send or 0,
                "sent": row.sent or 0,
                "percent_complete": row.percent_complete or 0,
                "start_time": row.start_time.isoformat() if row.start_time else None,
                "send_server": row.send_server or "",
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
    """Get store contracts."""

    try:
        contracts_rows = db.execute(text(
            "SELECT * FROM store_contracts ORDER BY id DESC"
        )).fetchall()

        contracts = [
            {
                "id": row.id,
                "site_id": row.site_id,
                "contract_file": row.contract_file or "",
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in contracts_rows
        ]

        return {"contracts": contracts}
    except Exception:
        return {"contracts": []}


@router.get("/storeoptions")
def get_storeoptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get all store options."""

    stores_rows = db.execute(text(
        "SELECT s.id, s.name, s.is_live, s.domain FROM sites AS s ORDER BY s.name"
    )).fetchall()

    stores = [
        {
            "id": row.id,
            "name": row.name,
            "is_live": row.is_live or "n",
            "domain": row.domain or "",
        }
        for row in stores_rows
    ]

    return {"stores": stores}


@router.get("/loginpagemessages")
def get_loginpagemessages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get admin login page messages."""

    try:
        messages_rows = db.execute(text(
            "SELECT * FROM admin_messages ORDER BY id DESC"
        )).fetchall()

        messages = []
        for row in messages_rows:
            messages.append({
                "id": row.id,
                "login_page_message": row.login_page_message or "",
                "main_page_message": row.main_page_message or "",
                "updated_at": row.updated_at.isoformat() if row.updated_at else None,
            })

        return {"messages": messages}
    except Exception:
        return {"messages": []}


@router.get("/benchmark-exclude")
def get_benchmark_exclude(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get benchmark excluded stores."""

    try:
        stores_rows = db.execute(text(
            "SELECT s.id, s.name, s.is_live, IFNULL(be.excluded, 'n') as excluded "
            "FROM sites AS s LEFT JOIN benchmark_exclude AS be ON s.id = be.site_id "
            "ORDER BY s.name"
        )).fetchall()

        excluded = []
        included = []

        for row in stores_rows:
            store_data = {
                "id": row.id,
                "name": row.name,
                "is_live": row.is_live or "n",
            }

            if row.excluded == 'y':
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
            "SELECT * FROM block_list ORDER BY id DESC"
        )).fetchall()

        blocks = [
            {
                "id": row.id,
                "block_type": row.block_type or "",
                "block_value": row.block_value or "",
                "reason": row.reason or "",
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in blocks_rows
        ]

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
    """Get DNS records for a store."""

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

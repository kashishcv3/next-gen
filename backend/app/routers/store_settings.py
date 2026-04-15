"""
Store Settings router — replicates old platform's:
  - Set Order ID (store_setorderid)
  - General Options (general_options, option_type=core)
  - Security Options (general_options, option_type=security)
  - Store Security (store_security — PCI/CVV2)

General/Security options stored in `general_options` table in central DB.
Set Order ID modifies per-store DB `full_order` auto_increment.
Store Security modifies `sites.store_cvv2` in central DB.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_user, get_current_admin_user
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
import traceback

router = APIRouter(prefix="/store-settings", tags=["store-settings"])

# Fields stored in general_options table (matches Store_Class::$general_options_fields)
GENERAL_OPTIONS_FIELDS = [
    "admin_search_boxes", "admin_append_name", "batch_size", "editor_type",
    "template_css_enabled", "gc_maxlifetime", "create_session_link",
    "captcha_forms", "captcha_method", "recaptcha_site_key", "recaptcha_secret_key",
    "recaptcha_score", "secure_logins", "iframe_allow", "csrf_actions",
    "email_validation_pages", "whitelisted_emails", "consider_invalid_status",
    "email_valid_retries", "email_valid_error_message", "email_valid_api_key_general",
]


# -------------------------------------------------------
# Pydantic models
# -------------------------------------------------------
class SetOrderIdRequest(BaseModel):
    nextorderid: str
    clearorders: Optional[str] = "n"


class GeneralOptionsRequest(BaseModel):
    display_name: Optional[str] = ""
    admin_search_boxes: Optional[str] = "n"
    admin_append_name: Optional[str] = "n"
    batch_size: Optional[str] = "25"
    editor_type: Optional[str] = "1"
    template_css_enabled: Optional[str] = "n"
    gc_maxlifetime: Optional[str] = "1440"
    create_session_link: Optional[str] = "n"
    generate_rest_keys: Optional[str] = ""


class SecurityOptionsRequest(BaseModel):
    captcha_forms: Optional[List[str]] = []
    captcha_method: Optional[str] = ""
    recaptcha_site_key: Optional[str] = ""
    recaptcha_secret_key: Optional[str] = ""
    recaptcha_score: Optional[str] = ""
    secure_logins: Optional[str] = "n"
    iframe_allow: Optional[str] = "n"
    csrf_actions: Optional[List[str]] = []
    email_validation_pages: Optional[List[str]] = []
    consider_invalid_status: Optional[List[str]] = []
    whitelisted_emails: Optional[str] = ""
    email_valid_retries: Optional[str] = ""
    email_valid_error_message: Optional[str] = ""
    email_valid_api_key_general: Optional[str] = ""
    ip_from_0: Optional[str] = ""
    ip_from_1: Optional[str] = ""
    ip_from_2: Optional[str] = ""
    ip_from_3: Optional[str] = ""
    ip_from_4: Optional[str] = ""
    ip_to_0: Optional[str] = ""
    ip_to_1: Optional[str] = ""
    ip_to_2: Optional[str] = ""
    ip_to_3: Optional[str] = ""
    ip_to_4: Optional[str] = ""
    ip_0: Optional[str] = ""
    ip_1: Optional[str] = ""
    ip_2: Optional[str] = ""
    ip_3: Optional[str] = ""
    ip_4: Optional[str] = ""


class StoreSecurityRequest(BaseModel):
    store_cvv2: Optional[str] = "n"


# -------------------------------------------------------
# Helper: get general_options for a site
# -------------------------------------------------------
def _get_general_options(site_id: int, db: Session) -> Dict[str, Any]:
    """Get all general_options for a site from central DB."""
    try:
        row = db.execute(text(
            "SELECT * FROM general_options WHERE site_id = :site_id"
        ), {"site_id": site_id}).first()

        if not row:
            return {}

        result = {}
        for field in GENERAL_OPTIONS_FIELDS:
            val = getattr(row, field, None)
            result[field] = val if val is not None else ""
        return result
    except Exception as e:
        print(f"Error getting general_options: {e}")
        return {}


# ===============================================================
# SET ORDER ID
# ===============================================================

@router.get("/setorderid/{site_id}")
def get_setorderid_info(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """Get current order ID info for the store."""
    store_db = None
    try:
        if current_user.user_type not in ("bigadmin", "bigadmin_limit"):
            raise HTTPException(status_code=403, detail="Bigadmin access required")

        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            return {"current_order_id": 0, "co_id": site_id}

        store_db = get_store_session(store_db_name)

        # Get current max order_id
        row = store_db.execute(text(
            "SELECT order_id FROM full_order ORDER BY order_id DESC LIMIT 1"
        )).first()

        current_id = row.order_id if row else 0

        return {
            "current_order_id": current_id,
            "co_id": site_id,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"get_setorderid_info error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/setorderid/{site_id}")
def set_order_id(
    site_id: int,
    payload: SetOrderIdRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """Set next order ID for the store. Replicates Store_Class::setNextOrderID()."""
    store_db = None
    try:
        if current_user.user_type not in ("bigadmin", "bigadmin_limit"):
            raise HTTPException(status_code=403, detail="Bigadmin access required")

        order_id = payload.nextorderid.strip()
        if not order_id or not order_id.isdigit():
            raise HTTPException(status_code=400, detail="Invalid order ID")

        order_id_int = int(order_id)
        clear_orders = payload.clearorders.lower() == "y"

        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store database not found")

        store_db = get_store_session(store_db_name)

        if clear_orders:
            # Truncate tables and set auto_increment
            store_db.execute(text("TRUNCATE rep_tracker"))
            store_db.execute(text("TRUNCATE full_order"))
            store_db.execute(text("TRUNCATE order_detail"))
            store_db.execute(text(
                f"ALTER TABLE full_order AUTO_INCREMENT = {order_id_int}"
            ))
            store_db.commit()
            return {
                "success": True,
                "message": f"Existing orders have been cleared and the next order ID for the store will be {order_id}",
            }
        else:
            # Check current max order_id
            row = store_db.execute(text(
                "SELECT order_id FROM full_order ORDER BY order_id DESC LIMIT 1"
            )).first()
            current_id = row.order_id if row else 0

            if order_id_int < current_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"The next order ID cannot be less than the current order ID ({current_id})",
                )

            store_db.execute(text(
                f"ALTER TABLE full_order AUTO_INCREMENT = {order_id_int}"
            ))
            store_db.commit()
            return {
                "success": True,
                "message": f"The next order ID for the store will be {order_id}",
            }
    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        print(f"set_order_id error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


# ===============================================================
# GENERAL OPTIONS (option_type=core)
# ===============================================================

@router.get("/general/{site_id}")
def get_general_options(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Get general (core) options for a store."""
    try:
        info = _get_general_options(site_id, db)

        # Get display_name from sites table
        site_row = db.execute(text(
            "SELECT display_name, config_file FROM sites WHERE id = :site_id"
        ), {"site_id": site_id}).first()

        info["display_name"] = site_row.display_name if site_row else ""

        # Get service_id from settings
        service_id = ""
        try:
            svc_row = db.execute(text(
                "SELECT service_id FROM settings WHERE site_id = :site_id LIMIT 1"
            ), {"site_id": site_id}).first()
            if svc_row:
                service_id = svc_row.service_id or ""
        except Exception:
            pass

        return {
            "info": info,
            "service_id": service_id,
            "co_id": site_id,
        }
    except Exception as e:
        print(f"get_general_options error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/general/{site_id}")
def save_general_options(
    site_id: int,
    payload: GeneralOptionsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Save general (core) options."""
    try:
        # Update display_name in sites table
        if payload.display_name is not None:
            db.execute(text(
                "UPDATE sites SET display_name = :name WHERE id = :site_id"
            ), {"name": payload.display_name, "site_id": site_id})

        # Update or insert general_options
        existing = db.execute(text(
            "SELECT site_id FROM general_options WHERE site_id = :site_id"
        ), {"site_id": site_id}).first()

        core_fields = {
            "admin_search_boxes": payload.admin_search_boxes or "n",
            "admin_append_name": payload.admin_append_name or "n",
            "batch_size": payload.batch_size or "25",
            "editor_type": payload.editor_type or "1",
            "template_css_enabled": payload.template_css_enabled or "n",
            "gc_maxlifetime": payload.gc_maxlifetime or "1440",
            "create_session_link": payload.create_session_link or "n",
        }

        if existing:
            set_clause = ", ".join(f"{k} = :{k}" for k in core_fields)
            db.execute(text(
                f"UPDATE general_options SET {set_clause} WHERE site_id = :site_id"
            ), {**core_fields, "site_id": site_id})
        else:
            cols = ", ".join(["site_id"] + list(core_fields.keys()))
            vals = ", ".join([":site_id"] + [f":{k}" for k in core_fields])
            db.execute(text(
                f"INSERT INTO general_options ({cols}) VALUES ({vals})"
            ), {**core_fields, "site_id": site_id})

        db.commit()
        return {"success": True, "message": "General options saved"}
    except Exception as e:
        db.rollback()
        print(f"save_general_options error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


# ===============================================================
# SECURITY OPTIONS (option_type=security)
# ===============================================================

@router.get("/security/{site_id}")
def get_security_options(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Get security options for a store."""
    try:
        info = _get_general_options(site_id, db)

        # Split comma-separated fields into arrays
        info["captcha_forms"] = [x for x in (info.get("captcha_forms", "") or "").split(",") if x]
        info["email_validation_pages"] = [x for x in (info.get("email_validation_pages", "") or "").split(",") if x]
        info["consider_invalid_status"] = [x for x in (info.get("consider_invalid_status", "") or "").split(",") if x]
        info["csrf_actions"] = [x for x in (info.get("csrf_actions", "") or "").split(",") if x]

        # Get store_cvv2 from sites table
        site_row = db.execute(text(
            "SELECT store_cvv2 FROM sites WHERE id = :site_id"
        ), {"site_id": site_id}).first()
        info["store_cvv2"] = site_row.store_cvv2 if site_row else "n"

        is_bigadmin = current_user.user_type in ("bigadmin", "bigadmin_limit")

        return {
            "info": info,
            "bigadmin": "y" if is_bigadmin else "n",
            "co_id": site_id,
        }
    except Exception as e:
        print(f"get_security_options error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/security/{site_id}")
def save_security_options(
    site_id: int,
    payload: SecurityOptionsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Save security options."""
    try:
        existing = db.execute(text(
            "SELECT site_id FROM general_options WHERE site_id = :site_id"
        ), {"site_id": site_id}).first()

        # Handle recaptcha_score: column is FLOAT, so convert empty string to None
        recaptcha_score_val = None
        if payload.recaptcha_score and payload.recaptcha_score.strip():
            try:
                recaptcha_score_val = float(payload.recaptcha_score)
            except ValueError:
                recaptcha_score_val = None

        # Handle email_valid_retries: may be numeric column
        email_retries_val = None
        if payload.email_valid_retries and payload.email_valid_retries.strip():
            email_retries_val = payload.email_valid_retries.strip()

        security_fields = {
            "captcha_forms": ",".join(payload.captcha_forms) if payload.captcha_forms else "",
            "captcha_method": payload.captcha_method or "",
            "recaptcha_site_key": payload.recaptcha_site_key or "",
            "recaptcha_secret_key": payload.recaptcha_secret_key or "",
            "recaptcha_score": recaptcha_score_val,
            "secure_logins": payload.secure_logins or "n",
            "iframe_allow": payload.iframe_allow or "n",
            "csrf_actions": ",".join(payload.csrf_actions) if payload.csrf_actions else "",
            "email_validation_pages": ",".join(payload.email_validation_pages) if payload.email_validation_pages else "",
            "consider_invalid_status": ",".join(payload.consider_invalid_status) if payload.consider_invalid_status else "",
            "whitelisted_emails": payload.whitelisted_emails or "",
            "email_valid_retries": email_retries_val,
            "email_valid_error_message": payload.email_valid_error_message or "",
            "email_valid_api_key_general": payload.email_valid_api_key_general or "",
        }

        if existing:
            set_clause = ", ".join(f"{k} = :{k}" for k in security_fields)
            db.execute(text(
                f"UPDATE general_options SET {set_clause} WHERE site_id = :site_id"
            ), {**security_fields, "site_id": site_id})
        else:
            cols = ", ".join(["site_id"] + list(security_fields.keys()))
            vals = ", ".join([":site_id"] + [f":{k}" for k in security_fields])
            db.execute(text(
                f"INSERT INTO general_options ({cols}) VALUES ({vals})"
            ), {**security_fields, "site_id": site_id})

        # Handle IP restrictions (stored separately or in the same table)
        # The old platform processes ip_from_0..4, ip_to_0..4, ip_0..4

        db.commit()
        return {"success": True, "message": "Security options saved"}
    except Exception as e:
        db.rollback()
        print(f"save_security_options error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


# ===============================================================
# STORE SECURITY (PCI/CVV2) — separate from general security options
# ===============================================================

@router.get("/store-security/{site_id}")
def get_store_security(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Get store security (PCI/CVV2) settings."""
    try:
        row = db.execute(text(
            "SELECT store_cvv2 FROM sites WHERE id = :site_id"
        ), {"site_id": site_id}).first()

        return {
            "store_cvv2": row.store_cvv2 if row else "n",
            "co_id": site_id,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/store-security/{site_id}")
def save_store_security(
    site_id: int,
    payload: StoreSecurityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Update store security (PCI/CVV2) settings."""
    try:
        db.execute(text(
            "UPDATE sites SET store_cvv2 = :cvv2 WHERE id = :site_id"
        ), {"cvv2": payload.store_cvv2 or "n", "site_id": site_id})
        db.commit()
        return {"success": True}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_admin_user

router = APIRouter(prefix="/checkout", tags=["checkout"])


def get_site_id(request: Request) -> int:
    """Extract site_id from request headers or query params."""
    site_id = request.headers.get("x-site-id") or request.query_params.get("site_id")
    if not site_id:
        raise HTTPException(status_code=400, detail="site_id is required")
    return int(site_id)


def get_checkout_columns(db: Session, table: str) -> set:
    """Dynamically detect available columns in a table."""
    try:
        result = db.execute(text(f"SHOW COLUMNS FROM {table}")).fetchall()
        return {row[0] for row in result}
    except Exception:
        return set()


# Mapping of checkout option types to their DB table/column patterns
CHECKOUT_TYPE_COLS = {
    'paypal': [
        'paypal_express', 'paypal_express_email', 'paypal_express_api_username',
        'paypal_express_api_password', 'paypal_express_api_signature',
        'paypal_express_sandbox', 'paypal_redirect_to_ppx',
        'paypal_ppcp_enabled', 'paypal_ppcp_client_id', 'paypal_ppcp_secret',
        'paypal_ppcp_merchant_id', 'paypal_ppcp_sandbox',
    ],
    'amazon-pay': [
        'amazon_pay_enabled', 'amazon_pay_merchant_id', 'amazon_pay_access_key',
        'amazon_pay_secret_key', 'amazon_pay_client_id', 'amazon_pay_region',
        'amazon_pay_sandbox', 'amazon_pay_currency_code',
    ],
    'bongo': [
        'bongo_enabled', 'bongo_merchant_id', 'bongo_api_key',
        'bongo_secret', 'bongo_sandbox',
    ],
    'sezzle': [
        'sezzle_enabled', 'sezzle_merchant_id', 'sezzle_public_key',
        'sezzle_private_key', 'sezzle_sandbox',
    ],
    'visa': [
        'visa_checkout_enabled', 'visa_checkout_api_key',
        'visa_checkout_profile_name', 'visa_checkout_sandbox',
    ],
}


@router.get("/options/{option_type}")
def get_checkout_options(
    option_type: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get checkout options for a given type (paypal, amazon-pay, bongo, sezzle, visa)."""
    site_id = get_site_id(request)

    try:
        # First try payment_options table
        cols = set()
        try:
            result = db.execute(text("SHOW COLUMNS FROM payment_options")).fetchall()
            cols = {row[0] for row in result}
        except Exception:
            pass

        expected_cols = CHECKOUT_TYPE_COLS.get(option_type, [])
        available = [c for c in expected_cols if c in cols]

        data = {}
        if available:
            select_cols = ", ".join(available)
            result = db.execute(
                text(f"SELECT {select_cols} FROM payment_options WHERE site_id = :site_id"),
                {"site_id": site_id}
            ).first()

            if result:
                for col in available:
                    val = getattr(result, col, '') or ''
                    data[col] = str(val)

        # Also try site_options table as fallback
        if not data:
            try:
                option_key = option_type.replace('-', '_')
                result = db.execute(text(
                    "SELECT option_name, option_value FROM site_options "
                    "WHERE site_id = :site_id AND option_type = :option_type"
                ), {"site_id": site_id, "option_type": f"checkout_{option_key}"}).fetchall()
                for row in result:
                    data[row[0]] = row[1] or ''
            except Exception:
                pass

        return {"data": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/options/{option_type}")
def save_checkout_options(
    option_type: str,
    options: Dict[str, Any],
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save checkout options for a given type."""
    site_id = get_site_id(request)

    try:
        cols = set()
        try:
            result = db.execute(text("SHOW COLUMNS FROM payment_options")).fetchall()
            cols = {row[0] for row in result}
        except Exception:
            pass

        expected_cols = CHECKOUT_TYPE_COLS.get(option_type, [])

        # Try to update payment_options table
        updates = []
        params = {"site_id": site_id}
        for key, value in options.items():
            if key in expected_cols and key in cols:
                updates.append(f"{key} = :{key}")
                params[key] = value

        if updates:
            query = f"UPDATE payment_options SET {', '.join(updates)} WHERE site_id = :site_id"
            db.execute(text(query), params)
            db.commit()
        else:
            # Fallback: save to site_options
            option_key = option_type.replace('-', '_')
            for key, value in options.items():
                db.execute(text(
                    "INSERT INTO site_options (site_id, option_type, option_name, option_value) "
                    "VALUES (:site_id, :option_type, :key, :value) "
                    "ON DUPLICATE KEY UPDATE option_value = :value"
                ), {"site_id": site_id, "option_type": f"checkout_{option_key}", "key": key, "value": value})
            db.commit()

        return {"message": f"{option_type} options saved successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

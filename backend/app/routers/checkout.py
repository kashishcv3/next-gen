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


def _get_checkout_columns(db: Session) -> set:
    """Dynamically detect available columns in checkout_alternative table."""
    try:
        result = db.execute(text("SHOW COLUMNS FROM checkout_alternative")).fetchall()
        return {row[0] for row in result}
    except Exception:
        return set()


# Column mappings per checkout type - matches old platform checkout_alternative table
CHECKOUT_TYPE_COLS = {
    'paypal': [
        'paypal_business', 'paypal_skip', 'paypal_use_shipping',
        'paypal_unreachable', 'paypal_exp_rest', 'paypal_exp_billing',
        'paypal_exp_shipping', 'paypal_exp_image',
        'paypal_exp_rest_version', 'paypal_exp_rest_clientid',
        'paypal_exp_rest_secret', 'paypal_exp_rest_environment',
        'paypal_exp_authonly', 'paypal_exp_username', 'paypal_exp_password',
        'paypal_exp_signature', 'paypal_onboarded', 'paypal_merchant_id_rest',
    ],
    'amazon_pay': [
        'amazon_pay', 'amazon_pay_testing', 'amazon_pay_test_declines',
        'amazon_merchant_id', 'amazon_access_key', 'amazon_secret_key',
        'amazon_client_id', 'amazon_client_key',
    ],
    'bongo': [
        'bongo_checkout', 'bongo_transfer', 'bongo_partner_key',
        'bongo_shipper', 'bongo_url', 'bongo_cancel_notify',
        'bongo_exclude_countries', 'bongo_dc_state', 'bongo_dc_zip',
        'bongo_dc_country',
    ],
    'sezzle': [
        'sezzle', 'sezzle_testing', 'sezzle_public_key', 'sezzle_private_key',
    ],
    'visa': [
        'visa_checkout', 'visa_testing', 'visa_merchant_id',
        'visa_key', 'visa_share', 'visa_enckey',
    ],
}


@router.get("/options/{option_type}")
def get_checkout_options(
    option_type: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get checkout options for a given type from checkout_alternative table."""
    site_id = get_site_id(request)

    try:
        cols = _get_checkout_columns(db)
        if not cols:
            return {"data": {}}

        # Normalize option_type (URL uses hyphens, DB uses underscores)
        db_type = option_type.replace('-', '_')
        expected_cols = CHECKOUT_TYPE_COLS.get(db_type, [])

        # Also dynamically include any columns that start with the type prefix
        type_prefix = db_type.rstrip('_') + '_'
        for c in cols:
            if c.startswith(type_prefix) and c not in expected_cols and c != 'site_id':
                expected_cols.append(c)

        available = [c for c in expected_cols if c in cols]
        if not available:
            return {"data": {}}

        select_cols = ", ".join(available)
        result = db.execute(
            text(f"SELECT {select_cols} FROM checkout_alternative WHERE site_id = :site_id"),
            {"site_id": site_id}
        ).first()

        if not result:
            return {"data": {}}

        data = {}
        for col in available:
            val = getattr(result, col, '') or ''
            data[col] = str(val)

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
    """Save checkout options for a given type to checkout_alternative table."""
    site_id = get_site_id(request)

    try:
        cols = _get_checkout_columns(db)
        if not cols:
            raise HTTPException(status_code=500, detail="checkout_alternative table not found")

        updates = []
        params = {"site_id": site_id}

        for key, value in options.items():
            if key in cols and key != 'site_id':
                updates.append(f"{key} = :{key}")
                params[key] = value

        if updates:
            query = f"UPDATE checkout_alternative SET {', '.join(updates)} WHERE site_id = :site_id"
            db.execute(text(query), params)
            db.commit()

        return {"message": f"{option_type} options saved successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

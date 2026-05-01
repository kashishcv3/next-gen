from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_admin_user

router = APIRouter(prefix="/payment", tags=["payment"])


def get_site_id(request: Request) -> int:
    """Extract site_id from request headers or query params."""
    site_id = request.headers.get("x-site-id") or request.query_params.get("site_id")
    if not site_id:
        raise HTTPException(status_code=400, detail="site_id is required")
    return int(site_id)


def get_payment_options_columns(db: Session) -> set:
    """Dynamically detect available columns in payment_options table."""
    try:
        result = db.execute(text("SHOW COLUMNS FROM payment_options")).fetchall()
        return {row[0] for row in result}
    except Exception:
        return set()


def get_payment_gateway_columns(db: Session) -> set:
    """Dynamically detect available columns in payment_gateway table."""
    try:
        result = db.execute(text("SHOW COLUMNS FROM payment_gateway")).fetchall()
        return {row[0] for row in result}
    except Exception:
        return set()


# =========================================
# CORE PAYMENT OPTIONS
# =========================================
@router.get("/options/core")
def get_core_payment_options(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get core payment options."""
    site_id = get_site_id(request)
    try:
        cols = get_payment_options_columns(db)
        if not cols:
            return {"data": {}}

        # Core options columns
        core_cols = [
            'payment_members_only', 'payment_methods', 'paypal_redirect_to_ppx',
        ]
        available = [c for c in core_cols if c in cols]
        if not available:
            return {"data": {}}

        select_cols = ", ".join(available)
        result = db.execute(
            text(f"SELECT {select_cols} FROM payment_options WHERE site_id = :site_id"),
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


@router.post("/options/core")
def save_core_payment_options(
    request: Request,
    options: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save core payment options."""
    site_id = get_site_id(request)
    try:
        cols = get_payment_options_columns(db)
        core_cols = ['payment_members_only', 'payment_methods', 'paypal_redirect_to_ppx']
        updates = []
        params = {"site_id": site_id}

        for key, value in options.items():
            if key in core_cols and key in cols:
                updates.append(f"{key} = :{key}")
                params[key] = value

        if updates:
            query = f"UPDATE payment_options SET {', '.join(updates)} WHERE site_id = :site_id"
            db.execute(text(query), params)
            db.commit()

        return {"message": "Core payment options saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# CREDIT CARDS OPTIONS
# =========================================
@router.get("/options/creditcards")
def get_creditcard_options(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get credit card options."""
    site_id = get_site_id(request)
    try:
        cols = get_payment_options_columns(db)
        if not cols:
            return {"data": {}}

        cc_cols = [
            'credit_cards', 'private_label_name', 'private_label_validation',
            'display_cvv2', 'require_cvv2', 'hide_cc_list', 'payment_gateway_unavailable',
        ]
        available = [c for c in cc_cols if c in cols]
        if not available:
            return {"data": {}}

        select_cols = ", ".join(available)
        result = db.execute(
            text(f"SELECT {select_cols} FROM payment_options WHERE site_id = :site_id"),
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


@router.post("/options/creditcards")
def save_creditcard_options(
    request: Request,
    options: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save credit card options."""
    site_id = get_site_id(request)
    try:
        cols = get_payment_options_columns(db)
        cc_cols = [
            'credit_cards', 'private_label_name', 'private_label_validation',
            'display_cvv2', 'require_cvv2', 'hide_cc_list', 'payment_gateway_unavailable',
        ]
        updates = []
        params = {"site_id": site_id}

        for key, value in options.items():
            if key in cc_cols and key in cols:
                updates.append(f"{key} = :{key}")
                params[key] = value

        if updates:
            query = f"UPDATE payment_options SET {', '.join(updates)} WHERE site_id = :site_id"
            db.execute(text(query), params)
            db.commit()

        return {"message": "Credit card options saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# PAYMENT GATEWAYS
# =========================================
@router.get("/options/gateways")
@router.get("/options/paymentgateways")
def get_payment_gateway_options(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get payment gateway options."""
    site_id = get_site_id(request)
    try:
        cols = get_payment_options_columns(db)
        data = {}

        # Get payment gateway type and tokenization from payment_options
        pg_cols = ['payment_gateway', 'tokenize_cc_numbers', 'authorize_cim', 'authorize_cim_env',
                   'payment_app_store_use', 'payment_app_store_config_id', 'payment_app_store_config']
        available_pg = [c for c in pg_cols if c in cols]

        if available_pg:
            select_cols = ", ".join(available_pg)
            result = db.execute(
                text(f"SELECT {select_cols} FROM payment_options WHERE site_id = :site_id"),
                {"site_id": site_id}
            ).first()

            if result:
                for col in available_pg:
                    val = getattr(result, col, '') or ''
                    data[col] = str(val)

        # Get payment gateway details from payment_gateway table
        gw_cols = get_payment_gateway_columns(db)
        if gw_cols:
            gw_select = [c for c in ['type', 'username', 'password', 'option1', 'option2',
                         'option3', 'option4', 'option5', 'auth_full_amount', 'auth_x_days',
                         'avs_mismatch', 'service_location', 'partner', 'security_key',
                         'payer_auth', 'get_token', 'auth_amount', 'custom_fields'] if c in gw_cols]

            if gw_select:
                gw_result = db.execute(
                    text(f"SELECT {', '.join(f'`{c}`' for c in gw_select)} FROM payment_gateway WHERE site_id = :site_id"),
                    {"site_id": site_id}
                ).first()

                if gw_result:
                    for col in gw_select:
                        val = getattr(gw_result, col, '') or ''
                        data[f"gateway_{col}"] = str(val)

        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/options/gateways")
@router.post("/options/paymentgateways")
def save_payment_gateway_options(
    request: Request,
    options: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save payment gateway options."""
    site_id = get_site_id(request)
    try:
        cols = get_payment_options_columns(db)
        pg_cols = ['payment_gateway', 'tokenize_cc_numbers', 'authorize_cim', 'authorize_cim_env',
                   'payment_app_store_use', 'payment_app_store_config_id', 'payment_app_store_config',
                   'payment_app_store_save_disabled']
        updates = []
        params = {"site_id": site_id}

        for key, value in options.items():
            if key in pg_cols and key in cols:
                updates.append(f"{key} = :{key}")
                params[key] = value

        if updates:
            query = f"UPDATE payment_options SET {', '.join(updates)} WHERE site_id = :site_id"
            db.execute(text(query), params)
            db.commit()

        return {"message": "Payment gateway options saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# TOKENIZATION SERVICES
# =========================================
@router.get("/options/tokenization")
def get_tokenization_options(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get tokenization options."""
    site_id = get_site_id(request)
    try:
        cols = get_payment_options_columns(db)
        if not cols:
            return {"data": {}}

        token_cols = [
            'tokenize_cc_numbers', 'authorize_cim', 'authorize_cim_env',
        ]
        available = [c for c in token_cols if c in cols]
        if not available:
            return {"data": {}}

        select_cols = ", ".join(available)
        result = db.execute(
            text(f"SELECT {select_cols} FROM payment_options WHERE site_id = :site_id"),
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


@router.post("/options/tokenization")
def save_tokenization_options(
    request: Request,
    options: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save tokenization options."""
    site_id = get_site_id(request)
    try:
        cols = get_payment_options_columns(db)
        token_cols = ['tokenize_cc_numbers', 'authorize_cim', 'authorize_cim_env']
        updates = []
        params = {"site_id": site_id}

        for key, value in options.items():
            if key in token_cols and key in cols:
                updates.append(f"{key} = :{key}")
                params[key] = value

        if updates:
            query = f"UPDATE payment_options SET {', '.join(updates)} WHERE site_id = :site_id"
            db.execute(text(query), params)
            db.commit()

        return {"message": "Tokenization options saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# WALLET AND PAYMENT METHODS
# =========================================
@router.get("/options/wallet")
def get_wallet_options(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get wallet and payment method options."""
    site_id = get_site_id(request)
    try:
        cols = get_payment_options_columns(db)
        if not cols:
            return {"data": {}}

        wallet_cols = [
            'enable_google_pay', 'google_pay_config',
            'enable_apple_pay', 'apple_pay_config',
            'enable_venmo', 'venmo_config',
        ]
        available = [c for c in wallet_cols if c in cols]
        if not available:
            return {"data": {}}

        select_cols = ", ".join(available)
        result = db.execute(
            text(f"SELECT {select_cols} FROM payment_options WHERE site_id = :site_id"),
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


@router.post("/options/wallet")
def save_wallet_options(
    request: Request,
    options: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save wallet and payment method options."""
    site_id = get_site_id(request)
    try:
        cols = get_payment_options_columns(db)
        wallet_cols = [
            'enable_google_pay', 'google_pay_config',
            'enable_apple_pay', 'apple_pay_config',
            'enable_venmo', 'venmo_config',
        ]
        updates = []
        params = {"site_id": site_id}

        for key, value in options.items():
            if key in wallet_cols and key in cols:
                updates.append(f"{key} = :{key}")
                params[key] = value

        if updates:
            query = f"UPDATE payment_options SET {', '.join(updates)} WHERE site_id = :site_id"
            db.execute(text(query), params)
            db.commit()

        return {"message": "Wallet options saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# ELECTRONIC CHECKS
# =========================================
@router.get("/options/echecks")
def get_echeck_options(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get electronic check options."""
    site_id = get_site_id(request)
    try:
        cols = get_payment_options_columns(db)
        if not cols:
            return {"data": {}}

        echeck_cols = [
            'echeck', 'echeck_user', 'echeck_trans_key',
        ]
        available = [c for c in echeck_cols if c in cols]
        if not available:
            return {"data": {}}

        select_cols = ", ".join(available)
        result = db.execute(
            text(f"SELECT {select_cols} FROM payment_options WHERE site_id = :site_id"),
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


@router.post("/options/echecks")
def save_echeck_options(
    request: Request,
    options: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save electronic check options."""
    site_id = get_site_id(request)
    try:
        cols = get_payment_options_columns(db)
        echeck_cols = ['echeck', 'echeck_user', 'echeck_trans_key']
        updates = []
        params = {"site_id": site_id}

        for key, value in options.items():
            if key in echeck_cols and key in cols:
                updates.append(f"{key} = :{key}")
                params[key] = value

        if updates:
            query = f"UPDATE payment_options SET {', '.join(updates)} WHERE site_id = :site_id"
            db.execute(text(query), params)
            db.commit()

        return {"message": "Electronic check options saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

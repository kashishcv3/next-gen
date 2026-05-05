from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_admin_user
import json

router = APIRouter(prefix="/payment", tags=["payment"])


# =========================================
# GATEWAY DEFINITIONS - matches old Options_Class::getPaymentGatewayOptions()
# =========================================
GATEWAY_DEFINITIONS = {
    '0': {'name': 'None'},
    '2': {
        'name': 'Authorize.Net Legacy',
        'username': 'Username',
        'password': 'Transaction Key',
        'auth': {'AUTH_CAPTURE': 'Auth/Capture', 'AUTH_ONLY': 'Auth Only'},
        'service_location': {
            'https://secure.authorize.net/gateway/transact.dll': 'Authorize.Net',
            'https://x1.cardknox.com/authorize': 'Cardknox',
            'https://pay1.plugnpay.com/payment/pnpremote.cgi': 'Mercury Payment Systems',
            'https://dev-gw.rocketgate.com/hostedpage/servlet/AuthNetEmulator': 'Rocketgate Testing Environment',
            'https://gw.rocketgate.com/hostedpage/servlet/AuthNetEmulator': 'Rocketgate Production Environment',
        },
        'environment': {'TRUE': 'Testing', 'FALSE': 'Production'},
        'version': {'1': 'V1', '2': 'V2'},
        'anet_customer_profiles': True,
    },
    '20': {
        'name': 'Authorize.Net CIM',
        'username': 'Username',
        'password': 'Transaction Key',
        'auth': {'AUTH_CAPTURE': 'Auth/Capture', 'AUTH_ONLY': 'Auth Only'},
        'environment': {'TRUE': 'Testing', 'FALSE': 'Production'},
        'version': {'1': 'V1', '2': 'V2'},
        'anet_customer_profiles': True,
    },
    '22': {
        'name': 'CardConnect',
        'merchant_id': 'Merchant ID',
        'username': 'Username',
        'password': 'Password',
        'auth': {'AUTH_CAPTURE': 'Auth/Capture', 'AUTH_ONLY': 'Auth Only'},
        'get_token': 'Tokenize Cards?',
        'option4': 'API Domain',
        'custom': 'Custom Fields',
        'get_auth_amount': 'y',
    },
    '9': {
        'name': 'Chase Paymentech',
        'username': 'Merchant ID',
        'auth': {'AC': 'Auth/Capture', 'A': 'Auth Only'},
        'platform': {'000001': 'Salem', '000002': 'Tampa'},
        'terminal': 'Terminal ID',
        'currency': {'840': 'American Dollars', '124': 'Canadian Dollars'},
        'note': 'To use this API, your Paymentech account must be (1) in certified/production status AND (2) linked to our Orbital Connection Username, which is "COMMERCEV3".',
    },
    '18': {
        'name': 'CyberSource',
        'username': 'Merchant ID',
        'password': 'API Key ID (only required for REST API)',
        'auth': {'AUTH_CAPTURE': 'Auth/Capture', 'AUTH_ONLY': 'Auth Only'},
        'request_type': {'SOAP': 'SOAP', 'REST': 'REST'},
        'payer_auth': 'Enable Payer Authentication',
        'get_token': 'Create Subscription?',
        'security_key': 'Transaction Key',
        'note': 'In order to create a subscription, your CyberSource account must be activated for customer profiles.',
    },
    '13': {
        'name': 'Litle / Vantiv',
        'username': 'User',
        'password': 'Password',
        'auth': {'sale': 'Auth/Capture', 'authorization': 'Auth Only', 'registerTokenRequest': 'Tokenize'},
        'merchant_id': 'Merchant ID',
        'option4': 'Report Group',
        'environment': {'TRUE': 'Testing', 'FALSE': 'Production'},
    },
    '17': {
        'name': 'Merchant e-Solutions Legacy',
        'username': 'Profile ID',
        'password': 'Profile Key',
        'auth': {'sale': 'Auth/Capture', 'auth': 'Auth Only'},
        'environment': {'TRUE': 'Testing', 'FALSE': 'Production'},
        'currency_code': 'y',
    },
    '14': {
        'name': 'Mercury Payment Systems',
        'username': 'Merchant ID',
        'password': 'Password',
        'auth': {'sale': 'Auth/Capture', 'authorization': 'Auth Only'},
        'environment': {'TRUE': 'Testing', 'FALSE': 'Production'},
    },
    '3': {
        'name': 'PayPal Payflow Pro',
        'username': 'Username',
        'password': 'Password',
        'auth': {'S': 'Auth/Capture', 'A': 'Auth Only'},
        'option4': 'Vendor (leave blank if none)',
        'partner': 'Partner',
    },
    '10': {
        'name': 'PayPal Website Payments Pro',
        'auth': {'Sale': 'Auth/Capture', 'Authorization': 'Auth Only'},
        'note': 'You are required to use Express Checkout in addition to Direct Payment.',
    },
    '19': {
        'name': 'plugnpay',
        'username': 'Profile ID',
        'password': 'Profile Key',
        'auth': {'sale': 'Auth/Capture', 'auth': 'Auth Only'},
    },
    '16': {
        'name': 'Sage VT',
        'username': 'Merchant ID',
        'password': 'Merchant Key',
        'auth': {'sale': 'Auth/Capture', 'auth': 'Auth Only'},
    },
    '11': {
        'name': 'Sterling',
        'username': 'Secure Net ID',
        'password': 'Secure Key',
        'auth': {'AUTH_CAPTURE': 'Auth/Capture', 'AUTH_ONLY': 'Auth Only'},
        'environment': {'TRUE': 'Testing', 'FALSE': 'Production'},
    },
    '15': {
        'name': 'USAePay',
        'username': 'Merchant Key',
        'auth': {'sale': 'Auth/Capture', 'auth': 'Auth Only'},
        'environment': {'TRUE': 'Testing', 'FALSE': 'Production'},
    },
    '21': {
        'name': 'Verifone Payware Connect',
        'username': 'Username',
        'password': 'Password',
        'auth': {'SALE': 'Auth/Capture', 'PRE_AUTH': 'Auth Only'},
        'merchant_id': 'Merchant Key',
        'option4': 'Client ID',
        'get_auth_amount': 'y',
        'environment': {
            'https://cert.api.vfipayna.com/IPCHAPI/RH.ASPX': 'Demo/Testing',
            'https://prod1.ipcharge.net/ipchapi/rh.aspx': 'Production',
            'https://api.vfipayna.com/IPCHAPI/RH.ASPX': 'Production V2',
        },
    },
    '12': {
        'name': 'Virtual Merchant',
        'username': 'User ID',
        'password': 'PIN',
        'auth': {'CCSALE': 'Auth/Capture', 'CCAUTHONLY': 'Auth Only'},
        'merchant_id': 'Merchant ID',
        'environment': {'TRUE': 'Testing', 'FALSE': 'Production'},
    },
}

# Gateway IDs that support tokenization
TOKENS_AVAILABLE = ['20', '18', '17', '3', '10', '15']


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


def get_sites_ext_columns(db: Session) -> set:
    """Dynamically detect available columns in sites_ext table."""
    try:
        result = db.execute(text("SHOW COLUMNS FROM sites_ext")).fetchall()
        return {row[0] for row in result}
    except Exception:
        return set()


# =========================================
# CORE PAYMENT OPTIONS
# =========================================

# Payment method options matching legacy Options_Class::getPaymentMethodOptions()
PAYMENT_METHOD_OPTIONS = {
    "creditcard": "Credit Card",
    "paypal": "PayPal",
    "paypal_express": "PayPal Express Checkout",
    "purchaseorder": "Purchase Order",
    "custom_paypal": "PayPal (Advanced)",
    "onfile": "Credit Card on File",
    "invoice": "Invoice Me",
    "echeck": "Electronic Check",
    "check": "Send Check",
    "call": "Call with Payment",
    "giftcertificate": "Gift Certificate",
}


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
            return {"data": {}, "payment_method_options": PAYMENT_METHOD_OPTIONS}

        core_cols = ['payment_members_only', 'payment_methods', 'paypal_redirect_to_ppx']
        available = [c for c in core_cols if c in cols]
        if not available:
            return {"data": {}, "payment_method_options": PAYMENT_METHOD_OPTIONS}

        select_cols = ", ".join(available)
        result = db.execute(
            text(f"SELECT {select_cols} FROM payment_options WHERE site_id = :site_id"),
            {"site_id": site_id}
        ).first()

        if not result:
            return {"data": {}, "payment_method_options": PAYMENT_METHOD_OPTIONS}

        data = {}
        for col in available:
            val = getattr(result, col, '') or ''
            data[col] = str(val)

        return {"data": data, "payment_method_options": PAYMENT_METHOD_OPTIONS}
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
# PAYMENT GATEWAYS - reads from sites_ext + payment_options
# =========================================
@router.get("/options/gateways")
@router.get("/options/paymentgateways")
def get_payment_gateway_options(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get payment gateway options - returns gateway definitions + current settings."""
    site_id = get_site_id(request)
    try:
        # 1) Get current gateway info from sites_ext (colorcommerce central DB)
        gateway_info = {}
        ext_cols = get_sites_ext_columns(db)
        if ext_cols:
            ext_select_candidates = [
                'type', 'username', 'password', 'option1', 'option2', 'option3',
                'option4', 'option5', 'auth_full_amount', 'auth_x_days',
                'avs_mismatch', 'service_location', 'partner', 'security_key',
                'payer_auth', 'get_token', 'auth_amount', 'custom_fields', 'active',
            ]
            ext_available = [c for c in ext_select_candidates if c in ext_cols]
            if ext_available:
                ext_result = db.execute(
                    text(f"SELECT {', '.join(f'`{c}`' for c in ext_available)} FROM sites_ext WHERE id = :site_id"),
                    {"site_id": site_id}
                ).first()
                if ext_result:
                    for col in ext_available:
                        val = getattr(ext_result, col, '') or ''
                        gateway_info[col] = str(val)

        # 2) Get payment config from payment_options
        po_cols = get_payment_options_columns(db)
        payment_opts = {}
        if po_cols:
            po_select = [c for c in [
                'authorize_cim', 'authorize_cim_env', 'tokenize_cc_numbers',
                'payment_app_store_use', 'payment_app_store_config_id',
                'payment_app_store_config', 'payment_app_store_save_disabled',
            ] if c in po_cols]
            if po_select:
                po_result = db.execute(
                    text(f"SELECT {', '.join(po_select)} FROM payment_options WHERE site_id = :site_id"),
                    {"site_id": site_id}
                ).first()
                if po_result:
                    for col in po_select:
                        val = getattr(po_result, col, '') or ''
                        payment_opts[col] = str(val)

        return {
            "data": {
                "gateway_definitions": GATEWAY_DEFINITIONS,
                "tokens_available": TOKENS_AVAILABLE,
                "current_gateway": gateway_info,
                "payment_options": payment_opts,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/options/gateways")
@router.post("/options/paymentgateways")
def save_payment_gateway_options(
    request: Request,
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Save payment gateway options.

    Expects payload:
    {
        "enabled_gateway": "2",  // the gateway type ID that is enabled, or "0" for none
        "gateway": {
            "username": "...",
            "password": "...",
            "option1": "...",
            ... etc
        },
        "payment_options": {
            "authorize_cim": "y",
            "authorize_cim_env": "0",
            "tokenize_cc_numbers": "n",
        }
    }
    """
    site_id = get_site_id(request)
    try:
        enabled_gateway = str(payload.get('enabled_gateway', '0'))
        gw_data = payload.get('gateway', {})
        po_data = payload.get('payment_options', {})

        # 1) Update sites_ext
        ext_cols = get_sites_ext_columns(db)
        if ext_cols:
            if enabled_gateway == '0':
                # Disable gateway
                if 'active' in ext_cols:
                    db.execute(
                        text("UPDATE sites_ext SET active = 'n' WHERE id = :site_id"),
                        {"site_id": site_id}
                    )
            else:
                # Check if row exists
                existing = db.execute(
                    text("SELECT id FROM sites_ext WHERE id = :site_id"),
                    {"site_id": site_id}
                ).first()

                # Helper to safely convert to int (for integer columns)
                def safe_int(val, default=0):
                    if val is None or val == '':
                        return default
                    try:
                        return int(val)
                    except (ValueError, TypeError):
                        return default

                # Query column types for sites_ext to handle type-sensitive columns
                col_types = {}
                try:
                    type_rows = db.execute(
                        text("SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sites_ext'")
                    ).fetchall()
                    for r in type_rows:
                        col_types[r[0]] = {'data_type': r[1], 'column_type': r[2]}
                except Exception:
                    pass

                def coerce_value(col_name, val):
                    """Coerce value to match the column's data type."""
                    info = col_types.get(col_name, {})
                    dtype = info.get('data_type', 'varchar')
                    if dtype in ('int', 'tinyint', 'smallint', 'mediumint', 'bigint'):
                        if val is None or val == '':
                            return 0
                        try:
                            return int(val)
                        except (ValueError, TypeError):
                            return 0
                    elif dtype in ('decimal', 'float', 'double'):
                        if val is None or val == '':
                            return 0.0
                        try:
                            return float(val)
                        except (ValueError, TypeError):
                            return 0.0
                    elif dtype == 'enum':
                        # For enum columns, don't send empty string — skip them
                        if val is None or val == '':
                            return None  # signal to skip
                        return val
                    return val

                gw_fields_raw = {
                    'type': enabled_gateway,
                    'username': gw_data.get('username', ''),
                    'password': gw_data.get('password', ''),
                    'option1': gw_data.get('option1', ''),
                    'option2': gw_data.get('option2', ''),
                    'option3': gw_data.get('option3', ''),
                    'option4': gw_data.get('option4', ''),
                    'option5': gw_data.get('option5', ''),
                    'auth_full_amount': gw_data.get('auth_full_amount', 'y'),
                    'auth_x_days': gw_data.get('auth_x_days', ''),
                    'avs_mismatch': gw_data.get('avs_mismatch', ''),
                    'service_location': gw_data.get('service_location', ''),
                    'partner': gw_data.get('partner', ''),
                    'security_key': gw_data.get('security_key', ''),
                    'payer_auth': gw_data.get('payer_auth', 'n'),
                    'get_token': gw_data.get('get_token', ''),
                    'auth_amount': gw_data.get('auth_amount', '1.00'),
                    'custom_fields': gw_data.get('custom_fields', ''),
                    'active': 'y',
                }

                # Coerce values based on column types and filter out None (skip) values
                gw_fields = {}
                for k, v in gw_fields_raw.items():
                    coerced = coerce_value(k, v)
                    if coerced is not None:
                        gw_fields[k] = coerced

                if existing:
                    # Update
                    updates = []
                    params = {"site_id": site_id}
                    for key, value in gw_fields.items():
                        if key in ext_cols:
                            updates.append(f"`{key}` = :{key}")
                            params[key] = value
                    if updates:
                        db.execute(
                            text(f"UPDATE sites_ext SET {', '.join(updates)} WHERE id = :site_id"),
                            params
                        )
                else:
                    # Insert
                    ins_cols = []
                    ins_vals = []
                    params = {"site_id": site_id}
                    for key, value in gw_fields.items():
                        if key in ext_cols:
                            ins_cols.append(f"`{key}`")
                            ins_vals.append(f":{key}")
                            params[key] = value
                    ins_cols.append("`id`")
                    ins_vals.append(":site_id")
                    db.execute(
                        text(f"INSERT INTO sites_ext ({', '.join(ins_cols)}) VALUES ({', '.join(ins_vals)})"),
                        params
                    )

                # Clear app store settings when standard gateway is selected
                po_cols = get_payment_options_columns(db)
                clear_fields = []
                clear_params = {"site_id": site_id}
                for field, val in [
                    ('payment_app_store_use', 'n'),
                    ('payment_app_store_save_disabled', '0'),
                    ('payment_app_store_config_id', '0'),
                    ('payment_app_store_config', ''),
                ]:
                    if field in po_cols:
                        clear_fields.append(f"{field} = :{field}")
                        clear_params[field] = val
                if clear_fields:
                    db.execute(
                        text(f"UPDATE payment_options SET {', '.join(clear_fields)} WHERE site_id = :site_id"),
                        clear_params
                    )

        # 2) Update payment_options
        po_cols = get_payment_options_columns(db)
        if po_cols and po_data:
            allowed_po = [
                'authorize_cim', 'authorize_cim_env', 'tokenize_cc_numbers',
                'payment_app_store_use', 'payment_app_store_config_id',
                'payment_app_store_config', 'payment_app_store_save_disabled',
            ]
            updates = []
            params = {"site_id": site_id}
            for key, value in po_data.items():
                if key in allowed_po and key in po_cols:
                    updates.append(f"{key} = :{key}")
                    params[key] = value
            if updates:
                db.execute(
                    text(f"UPDATE payment_options SET {', '.join(updates)} WHERE site_id = :site_id"),
                    params
                )

        db.commit()
        return {"message": "Payment gateway options saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# TOKENIZATION SERVICES
# =========================================

# FirstData Compass columns in the firstdata_compass table
FIRSTDATA_COMPASS_COLS = [
    'service_url', 'service_test_url', 'testing', 'service_id',
    'user', 'pass', 'pkey', 'currency_code', 'token_type',
]

# Mapping from frontend field names to DB column names
FIRSTDATA_FIELD_MAP = {
    'firstdata_compass_username': 'user',
    'firstdata_compass_password': 'pass',
    'firstdata_compass_passphrase': 'pkey',
    'firstdata_compass_service_url': 'service_url',
    'firstdata_compass_service_test_url': 'service_test_url',
    'firstdata_compass_testing': 'testing',
    'firstdata_compass_service_id': 'service_id',
    'firstdata_compass_currency_code': 'currency_code',
    'firstdata_compass_token_type': 'token_type',
}

# Reverse mapping: DB col -> frontend field name
FIRSTDATA_REVERSE_MAP = {v: k for k, v in FIRSTDATA_FIELD_MAP.items()}


def _get_firstdata_compass_columns(db: Session) -> set:
    """Dynamically detect columns in firstdata_compass table."""
    try:
        result = db.execute(text("SHOW COLUMNS FROM firstdata_compass")).fetchall()
        return {row[0] for row in result}
    except Exception:
        return set()


@router.get("/options/tokenization")
def get_tokenization_options(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get tokenization options including FirstData Compass config."""
    site_id = get_site_id(request)
    try:
        data = {}

        # 1) Read payment_options flags
        cols = get_payment_options_columns(db)
        po_token_cols = [
            'tokenize_cc_numbers', 'authorize_cim', 'authorize_cim_env',
            'enable_firstdata_compass', 'firstdata_authorize',
        ]
        available_po = [c for c in po_token_cols if c in cols]
        if available_po:
            select_cols = ", ".join(available_po)
            result = db.execute(
                text(f"SELECT {select_cols} FROM payment_options WHERE site_id = :site_id"),
                {"site_id": site_id}
            ).first()
            if result:
                for col in available_po:
                    val = getattr(result, col, '') or ''
                    data[col] = str(val)

        # 2) Read firstdata_compass config (single-row table, no site_id filter)
        fd_cols = _get_firstdata_compass_columns(db)
        if fd_cols:
            available_fd = [c for c in FIRSTDATA_COMPASS_COLS if c in fd_cols]
            if available_fd:
                select_fd = ", ".join(available_fd)
                fd_result = db.execute(
                    text(f"SELECT {select_fd} FROM firstdata_compass LIMIT 1")
                ).first()
                if fd_result:
                    for col in available_fd:
                        frontend_key = FIRSTDATA_REVERSE_MAP.get(col, col)
                        val = getattr(fd_result, col, '') or ''
                        data[frontend_key] = str(val)

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
    """Save tokenization options including FirstData Compass config."""
    site_id = get_site_id(request)
    try:
        # 1) Save payment_options flags
        cols = get_payment_options_columns(db)
        po_token_cols = [
            'tokenize_cc_numbers', 'authorize_cim', 'authorize_cim_env',
            'enable_firstdata_compass', 'firstdata_authorize',
        ]
        po_updates = []
        po_params = {"site_id": site_id}
        for key, value in options.items():
            if key in po_token_cols and key in cols:
                po_updates.append(f"{key} = :{key}")
                po_params[key] = value
        if po_updates:
            db.execute(
                text(f"UPDATE payment_options SET {', '.join(po_updates)} WHERE site_id = :site_id"),
                po_params
            )

        # 2) Save firstdata_compass config
        fd_cols = _get_firstdata_compass_columns(db)
        if fd_cols:
            fd_updates = []
            fd_params = {}
            for frontend_key, db_col in FIRSTDATA_FIELD_MAP.items():
                if frontend_key in options and db_col in fd_cols:
                    fd_updates.append(f"{db_col} = :{db_col}")
                    fd_params[db_col] = options[frontend_key]

            if fd_updates:
                # Check if row exists
                count_result = db.execute(
                    text("SELECT COUNT(*) as cnt FROM firstdata_compass")
                ).first()
                if count_result and count_result.cnt > 0:
                    db.execute(
                        text(f"UPDATE firstdata_compass SET {', '.join(fd_updates)}"),
                        fd_params
                    )
                else:
                    col_names = ", ".join(fd_params.keys())
                    col_placeholders = ", ".join(f":{k}" for k in fd_params.keys())
                    db.execute(
                        text(f"INSERT INTO firstdata_compass ({col_names}) VALUES ({col_placeholders})"),
                        fd_params
                    )

        db.commit()
        return {"message": "Tokenization options saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# WALLET AND PAYMENT METHODS
# =========================================

def _parse_gpay_settings(raw_json: str) -> dict:
    """Parse gpay_psp_settings JSON into flat frontend fields."""
    result = {}
    try:
        data = json.loads(raw_json) if raw_json else {}
    except (json.JSONDecodeError, TypeError):
        return result
    result['google_pay_merchant_name'] = data.get('merchant_name', '')
    result['google_pay_merchant_id'] = data.get('merchant_id', '')
    creds = data.get('credentials', [{}])
    if creds and isinstance(creds, list) and len(creds) > 0:
        cred_dict = creds[0] if isinstance(creds[0], dict) else {}
        keys = list(cred_dict.keys())
        vals = list(cred_dict.values())
        for i in range(4):
            result[f'label_gpay_psp_credential_{i+1}'] = keys[i] if i < len(keys) else ''
            result[f'google_pay_credential_{i+1}'] = vals[i] if i < len(vals) else ''
    return result


def _parse_apple_settings(raw_json: str) -> dict:
    """Parse apple_psp_settings JSON into flat frontend fields."""
    result = {}
    try:
        data = json.loads(raw_json) if raw_json else {}
    except (json.JSONDecodeError, TypeError):
        return result
    result['apple_pay_merchant_identifier'] = data.get('merchant_identifier', '')
    result['apple_pay_merchant_verified_domain'] = data.get('merchant_verified_domain', '')
    result['apple_pay_merchant_display_name'] = data.get('merchant_display_name', '')
    creds = data.get('credentials', [{}])
    if creds and isinstance(creds, list) and len(creds) > 0:
        cred_dict = creds[0] if isinstance(creds[0], dict) else {}
        keys = list(cred_dict.keys())
        vals = list(cred_dict.values())
        for i in range(4):
            result[f'label_apple_psp_credential_{i+1}'] = keys[i] if i < len(keys) else ''
            result[f'apple_pay_credential_{i+1}'] = vals[i] if i < len(vals) else ''
    return result


def _parse_paypal_settings(raw_json: str) -> dict:
    """Parse paypal_psp_settings JSON into flat frontend fields."""
    result = {}
    try:
        data = json.loads(raw_json) if raw_json else {}
    except (json.JSONDecodeError, TypeError):
        return result
    for key in ['tracking_id', 'paypal_merchant_id', 'product_intent_id',
                'is_email_confirmed', 'account_status', 'permissions_granted',
                'consent_status', 'risk_status']:
        result[f'paypal_{key}'] = data.get(key, '')
    return result


def _build_gpay_json(options: dict) -> str:
    """Build gpay_psp_settings JSON from flat frontend fields."""
    creds = {}
    for i in range(1, 5):
        label = options.get(f'label_gpay_psp_credential_{i}', '')
        value = options.get(f'google_pay_credential_{i}', '')
        if label:
            creds[label] = value
    data = {
        'merchant_name': options.get('google_pay_merchant_name', ''),
        'merchant_id': options.get('google_pay_merchant_id', ''),
        'credentials': [creds] if creds else [],
    }
    return json.dumps(data)


def _build_apple_json(options: dict) -> str:
    """Build apple_psp_settings JSON from flat frontend fields."""
    creds = {}
    for i in range(1, 5):
        label = options.get(f'label_apple_psp_credential_{i}', '')
        value = options.get(f'apple_pay_credential_{i}', '')
        if label:
            creds[label] = value
    data = {
        'merchant_identifier': options.get('apple_pay_merchant_identifier', ''),
        'merchant_verified_domain': options.get('apple_pay_merchant_verified_domain', ''),
        'merchant_display_name': options.get('apple_pay_merchant_display_name', ''),
        'credentials': [creds] if creds else [],
    }
    return json.dumps(data)


@router.get("/options/wallet")
def get_wallet_options(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get wallet and payment method options with parsed JSON settings."""
    site_id = get_site_id(request)
    try:
        cols = get_payment_options_columns(db)
        if not cols:
            return {"data": {}}

        wallet_cols = [
            'enable_google_pay', 'gpay_psp_settings',
            'enable_apple_pay', 'apple_psp_settings',
            'enable_paypal_integration', 'paypal_prod', 'paypal_psp_settings',
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
        # Simple string fields
        for col in ['enable_google_pay', 'enable_apple_pay', 'enable_paypal_integration', 'paypal_prod']:
            if col in available:
                val = getattr(result, col, '') or ''
                data[col] = str(val)

        # Parse JSON settings into flat fields
        if 'gpay_psp_settings' in available:
            raw = getattr(result, 'gpay_psp_settings', '') or ''
            data['gpay_psp_settings_raw'] = str(raw)
            data.update(_parse_gpay_settings(raw))

        if 'apple_psp_settings' in available:
            raw = getattr(result, 'apple_psp_settings', '') or ''
            data['apple_psp_settings_raw'] = str(raw)
            data.update(_parse_apple_settings(raw))

        if 'paypal_psp_settings' in available:
            raw = getattr(result, 'paypal_psp_settings', '') or ''
            data['paypal_psp_settings_raw'] = str(raw)
            data.update(_parse_paypal_settings(raw))

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
    """Save wallet and payment method options, building JSON from flat fields."""
    site_id = get_site_id(request)
    try:
        cols = get_payment_options_columns(db)
        updates = []
        params = {"site_id": site_id}

        # Simple flag fields
        for key in ['enable_google_pay', 'enable_apple_pay', 'enable_paypal_integration', 'paypal_prod']:
            if key in options and key in cols:
                updates.append(f"{key} = :{key}")
                params[key] = options[key]

        # Build and save Google Pay JSON
        if 'gpay_psp_settings' in cols:
            if options.get('enable_google_pay', 'n').lower() in ('y', 'yes', '1'):
                gpay_json = _build_gpay_json(options)
            else:
                gpay_json = ''
            updates.append("gpay_psp_settings = :gpay_psp_settings")
            params['gpay_psp_settings'] = gpay_json

        # Build and save Apple Pay JSON
        if 'apple_psp_settings' in cols:
            if options.get('enable_apple_pay', 'n').lower() in ('y', 'yes', '1'):
                apple_json = _build_apple_json(options)
            else:
                apple_json = ''
            updates.append("apple_psp_settings = :apple_psp_settings")
            params['apple_psp_settings'] = apple_json

        if updates:
            query = f"UPDATE payment_options SET {', '.join(updates)} WHERE site_id = :site_id"
            db.execute(text(query), params)
            db.commit()

        return {"message": "Wallet options saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/options/wallet/unlink-paypal")
def unlink_paypal_account(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Unlink PayPal account - clears paypal_psp_settings and disables integration."""
    site_id = get_site_id(request)
    try:
        cols = get_payment_options_columns(db)
        updates = []
        params = {"site_id": site_id}
        if 'enable_paypal_integration' in cols:
            updates.append("enable_paypal_integration = :epi")
            params['epi'] = 'n'
        if 'paypal_psp_settings' in cols:
            updates.append("paypal_psp_settings = :pps")
            params['pps'] = ''
        if updates:
            db.execute(
                text(f"UPDATE payment_options SET {', '.join(updates)} WHERE site_id = :site_id"),
                params
            )
            db.commit()
        return {"message": "PayPal account unlinked successfully"}
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

        echeck_cols = ['echeck', 'echeck_user', 'echeck_trans_key']
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

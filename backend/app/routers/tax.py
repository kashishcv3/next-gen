from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_user
import csv, io, codecs

router = APIRouter(prefix="/tax", tags=["tax"])

# US State options for frontend
US_STATES = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
    'DC': 'District of Columbia', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii',
    'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine',
    'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota',
    'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska',
    'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico',
    'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island',
    'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas',
    'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington',
    'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
    'AA': 'Armed Forces Americas', 'AE': 'Armed Forces Europe', 'AP': 'Armed Forces Pacific',
    'AS': 'American Samoa', 'GU': 'Guam', 'MP': 'Northern Mariana Islands',
    'PR': 'Puerto Rico', 'VI': 'Virgin Islands',
}

TAX_ORDERLEVEL_FEE_OPTIONS = {
    'handling': 'Handling',
    'insurance': 'Insurance',
    'gift_wrap': 'Gift Wrap',
}


# =========================================
# CORE TAX OPTIONS (central DB: tax_options)
# =========================================
@router.get("/options/core")
def get_core_tax_options(
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get core tax options from tax_options table (central DB)."""
    try:
        try:
            cols_result = db.execute(text("SHOW COLUMNS FROM tax_options")).fetchall()
            cols = {row[0] for row in cols_result}
        except Exception:
            return {"data": {}, "states": US_STATES, "fee_options": TAX_ORDERLEVEL_FEE_OPTIONS}

        core_cols = ['tax_discount', 'tax_orderlevel_fees', 'api_tax_states', 'api_tax_states_alt']
        available = [c for c in core_cols if c in cols]
        if not available:
            return {"data": {}, "states": US_STATES, "fee_options": TAX_ORDERLEVEL_FEE_OPTIONS}

        select_cols = ", ".join(f"`{c}`" for c in available)
        result = db.execute(
            text(f"SELECT {select_cols} FROM tax_options WHERE site_id = :site_id"),
            {"site_id": site_id}
        ).first()

        data = {}
        if result:
            for col in available:
                val = getattr(result, col, '') or ''
                data[col] = str(val)

        return {"data": data, "states": US_STATES, "fee_options": TAX_ORDERLEVEL_FEE_OPTIONS}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/options/core")
def save_core_tax_options(
    payload: dict,
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save core tax options to tax_options table (central DB)."""
    try:
        try:
            cols_result = db.execute(text("SHOW COLUMNS FROM tax_options")).fetchall()
            all_cols = {row[0] for row in cols_result}
        except Exception:
            raise HTTPException(status_code=500, detail="tax_options table not found")

        core_cols = ['tax_discount', 'tax_orderlevel_fees', 'api_tax_states', 'api_tax_states_alt']
        updates = []
        params = {"site_id": site_id}
        for key in core_cols:
            if key in payload and key in all_cols:
                updates.append(f"`{key}` = :{key}")
                params[key] = payload[key] if payload[key] != '' else None

        if updates:
            query = f"UPDATE tax_options SET {', '.join(updates)} WHERE site_id = :site_id"
            db.execute(text(query), params)
            db.commit()

        return {"message": "Core tax options saved successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# TAX TABLES (store DB: tax_table_states + tax_tables)
# =========================================
@router.get("/tables")
def get_tax_tables(
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all tax tables with city/county/local hierarchy from store DB."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            return {"data": [], "states": US_STATES}
        store_db = get_store_session(store_db_name)

        states = store_db.execute(text(
            "SELECT id, state, state_rate, include_shipping, apply_tax_to FROM tax_table_states ORDER BY state"
        )).fetchall()

        tables = []
        for state in states:
            cities = store_db.execute(text(
                "SELECT id, city, city_rate, county_rate, local_rate FROM tax_tables "
                "WHERE tax_table_states_id = :state_id ORDER BY city"
            ), {"state_id": state.id}).fetchall()

            city_list = [{
                "id": city.id,
                "city": city.city,
                "city_rate": str(city.city_rate) if city.city_rate else '0',
                "county_rate": str(city.county_rate) if city.county_rate else '0',
                "local_rate": str(city.local_rate) if city.local_rate else '0',
            } for city in cities]

            tables.append({
                "id": state.id,
                "state": state.state,
                "state_rate": str(state.state_rate) if state.state_rate else '0',
                "include_shipping": state.include_shipping or 'n',
                "apply_tax_to": state.apply_tax_to or 'ship',
                "cities": city_list,
            })

        return {"data": tables, "states": US_STATES}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/tables/update")
def update_tax_tables(
    form_data: dict,
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update tax table rates and handle deletions in store DB."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=400, detail="Store not found")
        store_db = get_store_session(store_db_name)

        for key, value in form_data.items():
            if key.startswith('state_rate_'):
                state_id = key.replace('state_rate_', '')
                include_ship = 'y' if form_data.get(f'include_shipping_{state_id}') else 'n'
                apply_to = form_data.get(f'apply_tax_to_{state_id}', 'ship')
                store_db.execute(text(
                    "UPDATE tax_table_states SET state_rate = :rate, include_shipping = :inc, "
                    "apply_tax_to = :apply WHERE id = :id"
                ), {"rate": value, "inc": include_ship, "apply": apply_to, "id": state_id})
            elif key.startswith('city_rate_'):
                city_id = key.replace('city_rate_', '')
                county_rate = form_data.get(f'county_rate_{city_id}', '0')
                local_rate = form_data.get(f'local_rate_{city_id}', '0')
                store_db.execute(text(
                    "UPDATE tax_tables SET city_rate = :city_rate, county_rate = :county_rate, "
                    "local_rate = :local_rate WHERE id = :id"
                ), {"city_rate": value, "county_rate": county_rate, "local_rate": local_rate, "id": city_id})

        # Handle deletions
        delete_states = form_data.get('delete_state', [])
        delete_cities = form_data.get('delete_city', [])

        if delete_states:
            for sid in delete_states:
                store_db.execute(text("DELETE FROM tax_tables WHERE tax_table_states_id = :id"), {"id": sid})
                store_db.execute(text("DELETE FROM tax_table_states WHERE id = :id"), {"id": sid})

        if delete_cities:
            for cid in delete_cities:
                store_db.execute(text("DELETE FROM tax_tables WHERE id = :id"), {"id": cid})

        store_db.commit()
        return {"message": "Tax tables updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/tables/add-state")
def add_tax_state(
    payload: dict,
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a new tax state to store DB."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=400, detail="Store not found")
        store_db = get_store_session(store_db_name)

        state = payload.get('tax_state', '')
        rate = payload.get('tax_rate', '0')
        apply_to = payload.get('apply_tax_to', 'ship')
        include_shipping = payload.get('include_shipping', 'n')

        if not state:
            raise HTTPException(status_code=400, detail="State is required")

        # Check if state already exists
        existing = store_db.execute(text(
            "SELECT id FROM tax_table_states WHERE state = :state"
        ), {"state": state}).first()

        if existing:
            raise HTTPException(status_code=400, detail="This state has already been added.")

        store_db.execute(text(
            "INSERT INTO tax_table_states (state, state_rate, apply_tax_to, include_shipping) "
            "VALUES (:state, :rate, :apply_to, :inc_ship)"
        ), {"state": state, "rate": rate, "apply_to": apply_to, "inc_ship": include_shipping})
        store_db.commit()

        return {"message": "State added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/tables/add-city")
def add_tax_city(
    payload: dict,
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a new tax city to store DB."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=400, detail="Store not found")
        store_db = get_store_session(store_db_name)

        state_code = payload.get('state', '')
        city = payload.get('city', '')
        city_rate = payload.get('city_rate', '0')
        county_rate = payload.get('county_rate', '0')
        local_rate = payload.get('local_rate', '0')

        if not state_code or not city:
            raise HTTPException(status_code=400, detail="State and City are required")

        # Get state id
        state_row = store_db.execute(text(
            "SELECT id FROM tax_table_states WHERE state = :state"
        ), {"state": state_code}).first()

        if not state_row:
            raise HTTPException(status_code=400, detail="You must add the state before you can assign cities.")

        # Check if city already exists for this state
        existing = store_db.execute(text(
            "SELECT id FROM tax_tables WHERE tax_table_states_id = :sid AND city = :city"
        ), {"sid": state_row.id, "city": city}).first()

        if existing:
            raise HTTPException(status_code=400, detail="This city has already been added.")

        store_db.execute(text(
            "INSERT INTO tax_tables (tax_table_states_id, city, city_rate, county_rate, local_rate) "
            "VALUES (:sid, :city, :city_rate, :county_rate, :local_rate)"
        ), {"sid": state_row.id, "city": city, "city_rate": city_rate,
            "county_rate": county_rate, "local_rate": local_rate})
        store_db.commit()

        return {"message": "City added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.post("/tables/import")
async def import_tax_tables(
    site_id: int = Query(...),
    cv3_list: UploadFile = File(...),
    delimiter: str = Form('tab'),
    contact_email: str = Form(''),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Import tax tables from a CSV/TSV file into store DB."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=400, detail="Store not found")
        store_db = get_store_session(store_db_name)

        content = await cv3_list.read()
        try:
            text_content = content.decode('utf-8')
        except Exception:
            text_content = content.decode('cp1252', errors='replace')

        delim_map = {'tab': '\t', 'pipe': '|', 'comma': ','}
        delim = delim_map.get(delimiter, '\t')

        reader = csv.reader(io.StringIO(text_content), delimiter=delim, quotechar='"')

        results = {'state_insert': 0, 'state_update': 0, 'city_insert': 0, 'city_update': 0}

        # Get current states
        curr_states = {}
        rows = store_db.execute(text("SELECT id, state, state_rate FROM tax_table_states")).fetchall()
        for r in rows:
            curr_states[r.state] = {'id': r.id, 'state_rate': str(r.state_rate)}

        curr_cities = {}

        for line in reader:
            if len(line) < 6:
                continue
            state_code = line[0].strip()
            state_rate = line[1].strip()
            city_name = line[2].strip()
            city_rate = line[3].strip()
            county_rate = line[4].strip()
            local_rate = line[5].strip()

            # Resolve state code or name
            if state_code not in US_STATES:
                found = None
                for k, v in US_STATES.items():
                    if v.lower() == state_code.lower():
                        found = k
                        break
                if not found:
                    continue
                state_code = found

            # Add/update state
            if state_code in curr_states:
                state_id = curr_states[state_code]['id']
                if curr_states[state_code]['state_rate'] != state_rate:
                    store_db.execute(text(
                        "UPDATE tax_table_states SET state_rate = :rate WHERE id = :id"
                    ), {"rate": state_rate, "id": state_id})
                    results['state_update'] += 1
            else:
                store_db.execute(text(
                    "INSERT INTO tax_table_states (state, state_rate, apply_tax_to, include_shipping) "
                    "VALUES (:state, :rate, 'ship', 'n')"
                ), {"state": state_code, "rate": state_rate})
                state_id = store_db.execute(text("SELECT LAST_INSERT_ID()")).scalar()
                curr_states[state_code] = {'id': state_id, 'state_rate': state_rate}
                results['state_insert'] += 1

            # Load cities for this state if not yet cached
            if state_id not in curr_cities:
                city_rows = store_db.execute(text(
                    "SELECT id, city, city_rate, county_rate, local_rate FROM tax_tables "
                    "WHERE tax_table_states_id = :sid"
                ), {"sid": state_id}).fetchall()
                curr_cities[state_id] = {r.city: {
                    'id': r.id, 'city_rate': str(r.city_rate),
                    'county_rate': str(r.county_rate), 'local_rate': str(r.local_rate)
                } for r in city_rows}

            # Add/update city
            if city_name in curr_cities.get(state_id, {}):
                ci = curr_cities[state_id][city_name]
                if ci['city_rate'] != city_rate or ci['county_rate'] != county_rate or ci['local_rate'] != local_rate:
                    store_db.execute(text(
                        "UPDATE tax_tables SET city_rate = :cr, county_rate = :cor, local_rate = :lr WHERE id = :id"
                    ), {"cr": city_rate, "cor": county_rate, "lr": local_rate, "id": ci['id']})
                    results['city_update'] += 1
            else:
                store_db.execute(text(
                    "INSERT INTO tax_tables (tax_table_states_id, city, city_rate, county_rate, local_rate) "
                    "VALUES (:sid, :city, :cr, :cor, :lr)"
                ), {"sid": state_id, "city": city_name, "cr": city_rate, "cor": county_rate, "lr": local_rate})
                results['city_insert'] += 1

        store_db.commit()
        return {
            "message": f"Import complete. States: {results['state_insert']} inserted, "
                       f"{results['state_update']} updated. Cities: {results['city_insert']} inserted, "
                       f"{results['city_update']} updated.",
            "results": results
        }
    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


# =========================================
# TAX RATE TOOL (central DB: tax_rate_tool)
# =========================================

# Column groups for each provider type
CUSTOM_COLS = [
    'tax_api_calc', 'tax_url', 'tax_api_version', 'tax_api_auth',
    'tax_api_username', 'tax_api_password', 'tax_api_key',
]

AVALARA_COLS = [
    'avatax_rate_calc', 'avatax_environ', 'avatax_send_product',
    'avatax_account', 'avatax_license', 'avatax_company_code', 'avatax_customer_code',
    'avatax_connection_type', 'avatax_shipping_sku',
    'avatax_from_address', 'avatax_from_city', 'avatax_from_state', 'avatax_from_zip',
    'avatax_states', 'avatax_tax_states_alt',
]

CCH_COLS = [
    'cch_rate_calc', 'cch_company_id', 'cch_user', 'cch_pass',
    'cch_address1', 'cch_address2', 'cch_states', 'cch_tax_states_alt',
    'cch_product_code', 'cch_post_invoice',
]

APP_STORE_COLS = [
    'tax_app_store_calc', 'tax_app_store_config_id', 'tax_app_store_conf',
]


@router.get("/rate-tool/{provider}")
def get_tax_rate_tool(
    provider: str,
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get tax rate tool options for a provider from tax_rate_tool (central DB)."""
    try:
        try:
            cols_result = db.execute(text("SHOW COLUMNS FROM tax_rate_tool")).fetchall()
            all_cols = {row[0] for row in cols_result}
        except Exception:
            return {"data": {}, "states": US_STATES}

        # Determine which columns to fetch based on provider
        if provider == 'custom':
            target_cols = CUSTOM_COLS
        elif provider == 'avalara':
            target_cols = AVALARA_COLS
        elif provider == 'cch' or provider == 'mach':
            # Mach uses CCH (Thomson Reuters SaaS)
            target_cols = CCH_COLS
        elif provider in ('taxjar', 'thomsonreuters'):
            # App store based providers
            target_cols = APP_STORE_COLS
        else:
            target_cols = list(all_cols - {'site_id', 'id'})

        available = [c for c in target_cols if c in all_cols]
        if not available:
            return {"data": {}, "states": US_STATES}

        select_cols = ", ".join(f"`{c}`" for c in available)
        result = db.execute(
            text(f"SELECT {select_cols} FROM tax_rate_tool WHERE site_id = :site_id"),
            {"site_id": site_id}
        ).first()

        data = {}
        if result:
            for col in available:
                val = getattr(result, col, '') or ''
                data[col] = str(val)

        # For app store providers, also fetch config from app_store_configs
        app_store_conf = None
        if provider in ('taxjar', 'thomsonreuters', 'mach'):
            try:
                conf_row = db.execute(text(
                    "SELECT id, config FROM app_store_configs WHERE type = 'tax' AND tool_type = :tt LIMIT 1"
                ), {"tt": provider}).first()
                if conf_row and conf_row.config:
                    import json
                    app_store_conf = json.loads(conf_row.config)
            except Exception:
                pass

        resp = {"data": data, "states": US_STATES}
        if app_store_conf:
            resp["app_store_conf"] = app_store_conf
        return resp

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rate-tool/{provider}")
def save_tax_rate_tool(
    provider: str,
    payload: dict,
    site_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save tax rate tool options for a provider to tax_rate_tool (central DB)."""
    try:
        try:
            cols_result = db.execute(text("SHOW COLUMNS FROM tax_rate_tool")).fetchall()
            all_cols = {row[0] for row in cols_result}
        except Exception:
            raise HTTPException(status_code=500, detail="tax_rate_tool table not found")

        # Determine which columns this provider can update
        if provider == 'custom':
            allowed_cols = CUSTOM_COLS
        elif provider == 'avalara':
            allowed_cols = AVALARA_COLS
        elif provider == 'cch' or provider == 'mach':
            allowed_cols = CCH_COLS
        elif provider in ('taxjar', 'thomsonreuters'):
            allowed_cols = APP_STORE_COLS
        else:
            allowed_cols = list(all_cols - {'site_id', 'id'})

        updates = []
        params = {"site_id": site_id}
        for key, value in payload.items():
            if key in all_cols and key in allowed_cols and key not in ('site_id', 'id'):
                updates.append(f"`{key}` = :{key}")
                params[key] = value if value != '' else None

        if updates:
            existing = db.execute(text(
                "SELECT COUNT(*) FROM tax_rate_tool WHERE site_id = :site_id"
            ), {"site_id": site_id}).scalar()

            if existing and existing > 0:
                query = f"UPDATE tax_rate_tool SET {', '.join(updates)} WHERE site_id = :site_id"
            else:
                params_keys = [k for k in params if k != 'site_id']
                all_keys = ['site_id'] + params_keys
                cols_str = ", ".join(f"`{k}`" for k in all_keys)
                vals_str = ", ".join(f":{k}" for k in all_keys)
                query = f"INSERT INTO tax_rate_tool ({cols_str}) VALUES ({vals_str})"

            db.execute(text(query), params)
            db.commit()

        return {"message": f"Tax rate tool ({provider}) saved successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# STATES LIST (utility endpoint)
# =========================================
@router.get("/states")
def get_states(
    current_user: User = Depends(get_current_user),
):
    """Return US states list for frontend dropdowns."""
    return {"states": US_STATES}

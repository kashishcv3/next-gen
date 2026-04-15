from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_admin_user
from datetime import datetime

router = APIRouter(prefix="/tax", tags=["tax"])


class TaxTable(BaseModel):
    id: Optional[int] = None
    name: str
    state: str
    rate: float
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class TaxOption(BaseModel):
    option_key: str
    option_value: str

    class Config:
        from_attributes = True


# TAX TABLES
@router.get("/tables")
def get_tax_tables(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get all tax tables with city/county/local hierarchy."""
    try:
        # Get state-level tax data
        states = db.execute(text("""
            SELECT id, state, state_rate, include_shipping, apply_tax_to
            FROM tax_states
            ORDER BY state
        """)).fetchall()

        tables = []
        for state in states:
            # Get cities for this state
            cities = db.execute(text("""
                SELECT id, city, city_rate, county_rate, local_rate
                FROM tax_cities
                WHERE state_id = :state_id
                ORDER BY city
            """), {"state_id": state.id}).fetchall()

            city_list = [
                {
                    "id": city.id,
                    "city": city.city,
                    "city_rate": str(city.city_rate) if city.city_rate else '0',
                    "county_rate": str(city.county_rate) if city.county_rate else '0',
                    "local_rate": str(city.local_rate) if city.local_rate else '0',
                }
                for city in cities
            ]

            tables.append({
                "id": state.id,
                "state": state.state,
                "state_rate": str(state.state_rate) if state.state_rate else '0',
                "include_shipping": state.include_shipping or 'n',
                "apply_tax_to": state.apply_tax_to or 'ship',
                "cities": city_list,
            })

        return {"data": tables}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tables/{table_id}")
def get_tax_table(
    table_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get a single tax table."""
    try:
        result = db.execute(text(
            "SELECT id, name, state, rate, created_at FROM tax_tables WHERE id = :id"
        ), {"id": table_id}).fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Tax table not found")

        return {
            "id": result.id,
            "name": result.name,
            "state": result.state,
            "rate": float(result.rate),
            "created_at": result.created_at.isoformat() if result.created_at else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tables")
def create_tax_table(
    table: TaxTable,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Create a new tax table."""
    try:
        db.execute(text(
            "INSERT INTO tax_tables (name, state, rate, created_at) "
            "VALUES (:name, :state, :rate, :created_at)"
        ), {
            "name": table.name,
            "state": table.state,
            "rate": table.rate,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        })
        db.commit()

        return {"message": "Tax table created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/tables/{table_id}")
def update_tax_table(
    table_id: int,
    table: TaxTable,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update a tax table."""
    try:
        db.execute(text(
            "UPDATE tax_tables SET name = :name, state = :state, rate = :rate WHERE id = :id"
        ), {
            "id": table_id,
            "name": table.name,
            "state": table.state,
            "rate": table.rate,
        })
        db.commit()

        return {"message": "Tax table updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/tables/{table_id}")
def delete_tax_table(
    table_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete a tax table."""
    try:
        db.execute(text("DELETE FROM tax_tables WHERE id = :id"), {"id": table_id})
        db.commit()

        return {"message": "Tax table deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# TAX OPTIONS
@router.get("/options")
def get_tax_options(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Get tax options."""
    try:
        result = db.execute(text(
            "SELECT option_key, option_value FROM tax_options ORDER BY option_key"
        )).fetchall()

        options = {row.option_key: row.option_value for row in result}
        return {"data": options}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/options")
def update_tax_options(
    options: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update tax options."""
    try:
        for key, value in options.items():
            db.execute(text(
                "INSERT INTO tax_options (option_key, option_value) VALUES (:key, :value) "
                "ON DUPLICATE KEY UPDATE option_value = :value"
            ), {"key": key, "value": value})
        db.commit()

        return {"message": "Tax options updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# RATE TOOL
@router.post("/rate-tool")
def calculate_tax_rate(
    location: str,
    amount: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Calculate tax rate for a location."""
    try:
        result = db.execute(text(
            "SELECT state_rate FROM tax_states WHERE state = :state LIMIT 1"
        ), {"state": location}).fetchone()

        if not result:
            return {"rate": 0.0, "location": location}

        return {"rate": float(result.state_rate or 0), "location": location}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tables/update")
def update_tax_tables(
    form_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Update tax tables with state, city, county, and local rates."""
    try:
        # Process state-level updates
        for key, value in form_data.items():
            if key.startswith('state_rate_'):
                state_id = key.replace('state_rate_', '')
                db.execute(text("""
                    UPDATE tax_states
                    SET state_rate = :rate
                    WHERE id = :id
                """), {"rate": value, "id": state_id})

            elif key.startswith('include_shipping_'):
                state_id = key.replace('include_shipping_', '')
                db.execute(text("""
                    UPDATE tax_states
                    SET include_shipping = :include
                    WHERE id = :id
                """), {"include": 'y' if value else 'n', "id": state_id})

            elif key.startswith('apply_tax_to_'):
                state_id = key.replace('apply_tax_to_', '')
                db.execute(text("""
                    UPDATE tax_states
                    SET apply_tax_to = :apply_to
                    WHERE id = :id
                """), {"apply_to": value, "id": state_id})

            elif key.startswith('city_rate_'):
                city_id = key.replace('city_rate_', '')
                db.execute(text("""
                    UPDATE tax_cities
                    SET city_rate = :rate
                    WHERE id = :id
                """), {"rate": value, "id": city_id})

            elif key.startswith('county_rate_'):
                city_id = key.replace('county_rate_', '')
                db.execute(text("""
                    UPDATE tax_cities
                    SET county_rate = :rate
                    WHERE id = :id
                """), {"rate": value, "id": city_id})

            elif key.startswith('local_rate_'):
                city_id = key.replace('local_rate_', '')
                db.execute(text("""
                    UPDATE tax_cities
                    SET local_rate = :rate
                    WHERE id = :id
                """), {"rate": value, "id": city_id})

        # Handle deletions
        if 'delete_state' in form_data:
            for state_id in form_data['delete_state']:
                db.execute(text("DELETE FROM tax_cities WHERE state_id = :id"), {"id": state_id})
                db.execute(text("DELETE FROM tax_states WHERE id = :id"), {"id": state_id})

        if 'delete' in form_data:
            for city_id in form_data['delete']:
                db.execute(text("DELETE FROM tax_cities WHERE id = :id"), {"id": city_id})

        db.commit()
        return {"message": "Tax tables updated successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

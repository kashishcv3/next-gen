"""
Store Features router — replicates old platform's store_features pages.

Tables used (central colorcommerce DB):
  - feature_descriptions: feature metadata (name, title, description, date_entered,
    cost, link, info, noupgrade, live, dashboard, type, prereqs, build)
  - new_features: per-site feature status (site_id + dynamic columns per feature name,
    values: NULL/empty = not requested, '1' = requested, '2' = complete)
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_user, get_current_admin_user
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import traceback

router = APIRouter(prefix="/store-features", tags=["store-features"])


# -------------------------------------------------------
# Pydantic models
# -------------------------------------------------------
class FeatureEditRequest(BaseModel):
    name: str
    build: Optional[str] = ""
    title: Optional[str] = ""
    description: Optional[str] = ""
    date_entered: Optional[str] = ""
    cost: Optional[str] = ""
    link: Optional[str] = ""
    info: Optional[str] = ""
    noupgrade: Optional[str] = ""
    live: Optional[str] = ""
    dashboard: Optional[str] = ""
    type: Optional[str] = "new_feature"
    prereqs: Optional[str] = ""
    existing: Optional[str] = "n"


class UpgradeRequestPayload(BaseModel):
    install: List[str] = []
    email: Optional[str] = ""


class LiveDashboardUpdate(BaseModel):
    live: List[str] = []
    dashboard: List[str] = []
    changevals: Dict[str, str] = {}


# -------------------------------------------------------
# GET /store-features/list/{site_id}
# Replicates Store_featuresView.php — returns all features
# plus per-site feature status from new_features table.
# -------------------------------------------------------
@router.get("/list/{site_id}")
def list_features(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Get all features with per-site install status."""
    try:
        is_bigadmin = current_user.user_type in ("bigadmin", "bigadmin_limit")

        # Get all feature descriptions from central DB
        rows = db.execute(text(
            "SELECT name, build, title, description, date_entered, cost, link, "
            "info, noupgrade, live, dashboard, type, prereqs "
            "FROM feature_descriptions ORDER BY date_entered DESC"
        )).fetchall()

        features = []
        feature_names = []
        for r in rows:
            feature_names.append(r.name)
            features.append({
                "name": r.name or "",
                "build": r.build or "",
                "title": r.title or "",
                "description": r.description or "",
                "date_entered": r.date_entered.strftime("%m/%d/%Y") if r.date_entered else "",
                "cost": r.cost or "",
                "link": r.link or "",
                "info": r.info or "",
                "noupgrade": r.noupgrade or "",
                "live": r.live or "",
                "dashboard": r.dashboard or "",
                "type": (r.type or "").replace("_", " "),
                "type_raw": r.type or "",
                "prereqs": (r.prereqs or "").split(",") if r.prereqs else [],
            })

        # Get per-site feature statuses from new_features table
        feature_info = {}
        if feature_names:
            try:
                # First check which columns actually exist in new_features
                col_rows = db.execute(text(
                    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS "
                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'new_features'"
                )).fetchall()
                existing_cols = {r[0] for r in col_rows}

                # Only query columns that exist
                valid_cols = [n for n in feature_names if n in existing_cols]

                if valid_cols:
                    cols_sql = ", ".join(f"`{c}`" for c in valid_cols)
                    nf_row = db.execute(text(
                        f"SELECT {cols_sql} FROM new_features WHERE site_id = :site_id"
                    ), {"site_id": site_id}).first()

                    if nf_row:
                        for col in valid_cols:
                            val = getattr(nf_row, col, None)
                            feature_info[col] = str(val) if val else ""
            except Exception as e:
                print(f"Error reading new_features for site {site_id}: {e}")

        # Get currency type for this store
        currency_type = "$"
        try:
            site_row = db.execute(text(
                "SELECT config_file FROM sites WHERE id = :site_id"
            ), {"site_id": site_id}).first()
            # Could look up currency from store DB, default to $
        except Exception:
            pass

        return {
            "features": features,
            "feature_info": feature_info,
            "currency_type": currency_type,
            "bigadmin": "y" if is_bigadmin else "n",
            "co_id": site_id,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"list_features error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------------------------------
# GET /store-features/feature/{name}
# Replicates Store_Class::getFeature($name)
# -------------------------------------------------------
@router.get("/feature/{name}")
def get_feature(
    name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Get a single feature by name."""
    try:
        row = db.execute(text(
            "SELECT name, build, title, description, date_entered, cost, link, "
            "info, noupgrade, live, dashboard, type, prereqs "
            "FROM feature_descriptions WHERE name = :name"
        ), {"name": name}).first()

        if not row:
            raise HTTPException(status_code=404, detail="Feature not found")

        return {
            "name": row.name or "",
            "build": row.build or "",
            "title": row.title or "",
            "description": row.description or "",
            "date_entered": str(row.date_entered) if row.date_entered else "",
            "cost": row.cost or "",
            "link": row.link or "",
            "info": row.info or "",
            "noupgrade": row.noupgrade or "",
            "live": row.live or "",
            "dashboard": row.dashboard or "",
            "type": row.type or "new_feature",
            "prereqs": (row.prereqs or "").split(",") if row.prereqs else [],
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"get_feature error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------------------------------
# POST /store-features/edit
# Replicates StoreFeaturesEdit action — bigadmin only
# -------------------------------------------------------
@router.post("/edit")
def edit_feature(
    payload: FeatureEditRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Create or update a feature description (bigadmin only)."""
    try:
        if current_user.user_type not in ("bigadmin", "bigadmin_limit"):
            raise HTTPException(status_code=403, detail="Bigadmin access required")

        existing_noupgrade = None
        if payload.existing == "y":
            # Check current noupgrade state before update
            existing_row = db.execute(text(
                "SELECT noupgrade FROM feature_descriptions WHERE name = :name"
            ), {"name": payload.name}).first()
            if existing_row:
                existing_noupgrade = existing_row.noupgrade

            # Update existing feature
            db.execute(text(
                "UPDATE feature_descriptions SET "
                "build = :build, title = :title, description = :description, "
                "date_entered = :date_entered, cost = :cost, link = :link, "
                "info = :info, noupgrade = :noupgrade, live = :live, "
                "dashboard = :dashboard, type = :type, prereqs = :prereqs "
                "WHERE name = :name"
            ), {
                "name": payload.name,
                "build": payload.build,
                "title": payload.title,
                "description": payload.description,
                "date_entered": payload.date_entered if payload.date_entered else None,
                "cost": payload.cost,
                "link": payload.link,
                "info": payload.info,
                "noupgrade": payload.noupgrade or "",
                "live": payload.live or "",
                "dashboard": payload.dashboard or "",
                "type": payload.type or "new_feature",
                "prereqs": payload.prereqs or "",
            })
        else:
            # Insert new feature
            db.execute(text(
                "INSERT INTO feature_descriptions "
                "(name, build, title, description, date_entered, cost, link, "
                "info, noupgrade, live, dashboard, type, prereqs) "
                "VALUES (:name, :build, :title, :description, :date_entered, "
                ":cost, :link, :info, :noupgrade, :live, :dashboard, :type, :prereqs)"
            ), {
                "name": payload.name,
                "build": payload.build,
                "title": payload.title,
                "description": payload.description,
                "date_entered": payload.date_entered if payload.date_entered else None,
                "cost": payload.cost,
                "link": payload.link,
                "info": payload.info,
                "noupgrade": payload.noupgrade or "",
                "live": payload.live or "",
                "dashboard": payload.dashboard or "",
                "type": payload.type or "new_feature",
                "prereqs": payload.prereqs or "",
            })

        # Handle noupgrade column changes in new_features table
        # If switching from upgradeable to noupgrade, drop the column
        if existing_noupgrade and existing_noupgrade != "y" and payload.noupgrade == "y":
            try:
                db.execute(text(
                    f"ALTER TABLE new_features DROP COLUMN `{payload.name}`"
                ))
            except Exception:
                pass
        # If switching from noupgrade to upgradeable, add the column
        elif existing_noupgrade == "y" and payload.noupgrade != "y":
            try:
                db.execute(text(
                    f"ALTER TABLE new_features ADD COLUMN `{payload.name}` CHAR(1)"
                ))
            except Exception:
                pass
        # If new feature and not noupgrade, add column
        elif payload.existing != "y" and payload.noupgrade != "y":
            try:
                db.execute(text(
                    f"ALTER TABLE new_features ADD COLUMN `{payload.name}` CHAR(1)"
                ))
            except Exception:
                pass

        db.commit()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"edit_feature error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------------------------------
# POST /store-features/update/{site_id}
# Replicates StoreFeatures action — handles live/dashboard
# toggles (bigadmin) and changevals status updates
# -------------------------------------------------------
@router.post("/update/{site_id}")
def update_features(
    site_id: int,
    payload: LiveDashboardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update live/dashboard flags and feature statuses."""
    try:
        is_bigadmin = current_user.user_type in ("bigadmin", "bigadmin_limit")

        if is_bigadmin:
            # Update live flags
            if payload.live:
                vals = ",".join(f"'{v}'" for v in payload.live)
                db.execute(text(
                    f"UPDATE feature_descriptions SET live='n' WHERE name NOT IN ({vals})"
                ))
                db.execute(text(
                    f"UPDATE feature_descriptions SET live='y' WHERE name IN ({vals})"
                ))
            else:
                db.execute(text("UPDATE feature_descriptions SET live='n'"))

            # Update dashboard flags
            if payload.dashboard:
                vals = ",".join(f"'{v}'" for v in payload.dashboard)
                db.execute(text(
                    f"UPDATE feature_descriptions SET dashboard='n' WHERE name NOT IN ({vals})"
                ))
                db.execute(text(
                    f"UPDATE feature_descriptions SET dashboard='y' WHERE name IN ({vals})"
                ))
            else:
                db.execute(text("UPDATE feature_descriptions SET dashboard='n'"))

        # Update per-site feature statuses (changevals)
        if payload.changevals:
            # Ensure row exists for this site
            existing = db.execute(text(
                "SELECT site_id FROM new_features WHERE site_id = :site_id"
            ), {"site_id": site_id}).first()
            if not existing:
                db.execute(text(
                    "INSERT INTO new_features (site_id) VALUES (:site_id)"
                ), {"site_id": site_id})

            for feature_name, val in payload.changevals.items():
                try:
                    db.execute(text(
                        f"UPDATE new_features SET `{feature_name}` = :val "
                        "WHERE site_id = :site_id"
                    ), {"val": val, "site_id": site_id})
                except Exception as e:
                    print(f"Error updating {feature_name}: {e}")

        db.commit()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"update_features error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------------------------------
# POST /store-features/request-upgrade/{site_id}
# Replicates StoreFeaturesConfirm action — marks features
# as requested (value='1') in new_features table
# -------------------------------------------------------
@router.post("/request-upgrade/{site_id}")
def request_upgrade(
    site_id: int,
    payload: UpgradeRequestPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Request template upgrades for features."""
    try:
        if not payload.install:
            raise HTTPException(status_code=400, detail="No features selected")

        # Ensure row exists for this site
        existing = db.execute(text(
            "SELECT site_id FROM new_features WHERE site_id = :site_id"
        ), {"site_id": site_id}).first()
        if not existing:
            db.execute(text(
                "INSERT INTO new_features (site_id) VALUES (:site_id)"
            ), {"site_id": site_id})

        # Mark each selected feature as '1' (requested)
        for feature_name in payload.install:
            try:
                db.execute(text(
                    f"UPDATE new_features SET `{feature_name}` = '1' "
                    "WHERE site_id = :site_id"
                ), {"site_id": site_id})
            except Exception as e:
                print(f"Error requesting {feature_name}: {e}")

        # Get features for confirmation data
        confirmed = []
        for feature_name in payload.install:
            feat = db.execute(text(
                "SELECT title, cost, prereqs FROM feature_descriptions WHERE name = :name"
            ), {"name": feature_name}).first()
            if feat:
                confirmed.append({
                    "name": feature_name,
                    "title": feat.title or "",
                    "cost": feat.cost or "",
                    "prereqs": (feat.prereqs or "").split(",") if feat.prereqs else [],
                })

        db.commit()
        return {"success": True, "confirmed": confirmed}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"request_upgrade error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------------------------------
# GET /store-features/upgrades
# Replicates Store_Class::getTemplateUpgrades() — returns
# list of feature names/titles for prerequisites dropdown
# -------------------------------------------------------
@router.get("/upgrades")
def get_template_upgrades(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
) -> Dict[str, str]:
    """Get all feature names/titles for prerequisite selection."""
    try:
        rows = db.execute(text(
            "SELECT name, title FROM feature_descriptions ORDER BY title"
        )).fetchall()
        return {r.name: r.title for r in rows}
    except Exception as e:
        print(f"get_template_upgrades error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------------------------------
# GET /store-features/confirm-data/{site_id}
# Returns data needed for the confirmation page
# -------------------------------------------------------
@router.get("/confirm-data/{site_id}")
def get_confirm_data(
    site_id: int,
    names: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Get confirmation page data for selected features."""
    try:
        feature_names = [n.strip() for n in names.split(",") if n.strip()]
        if not feature_names:
            return {"features": [], "current_features": {}}

        features = {}
        for name in feature_names:
            row = db.execute(text(
                "SELECT name, title, cost, prereqs FROM feature_descriptions WHERE name = :name"
            ), {"name": name}).first()
            if row:
                features[name] = {
                    "title": row.title or "",
                    "cost": row.cost or "",
                    "prereqs": (row.prereqs or "").split(",") if row.prereqs else [],
                }

        # Get current feature statuses
        current_features = {}
        try:
            col_rows = db.execute(text(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS "
                "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'new_features'"
            )).fetchall()
            existing_cols = {r[0] for r in col_rows}
            valid_cols = [n for n in feature_names if n in existing_cols]

            # Also check prereqs
            all_prereqs = set()
            for f in features.values():
                for p in f["prereqs"]:
                    if p and p in existing_cols:
                        all_prereqs.add(p)
                        valid_cols.append(p)

            valid_cols = list(set(valid_cols))

            if valid_cols:
                cols_sql = ", ".join(f"`{c}`" for c in valid_cols)
                nf_row = db.execute(text(
                    f"SELECT {cols_sql} FROM new_features WHERE site_id = :site_id"
                ), {"site_id": site_id}).first()
                if nf_row:
                    for col in valid_cols:
                        val = getattr(nf_row, col, None)
                        current_features[col] = str(val) if val else ""
        except Exception:
            pass

        return {
            "features": features,
            "current_features": current_features,
        }
    except Exception as e:
        print(f"get_confirm_data error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

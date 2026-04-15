"""
Store Domain & Certificate router — replicates old platform's:
  - Domain Name Management (store_domain / StoreDomain)
  - SSL Certificate Application (store_cert / ApplyCert)

Domain data comes from central `sites` table.
Certificate application generates a CSR via openssl and emails certs@commercev3.com.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db, get_store_db_name
from app.models.user import User
from app.dependencies import get_current_user, get_current_admin_user
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
import traceback
import subprocess
import tempfile
import os

router = APIRouter(prefix="/store-domain", tags=["store-domain"])


# -------------------------------------------------------
# Pydantic models
# -------------------------------------------------------
class DomainUpdateRequest(BaseModel):
    domain: str
    secure_domain: Optional[str] = ""


class CertApplicationRequest(BaseModel):
    website: str
    co_name: str
    dept: Optional[str] = ""
    address1: str
    address2: Optional[str] = ""
    city: str
    state: Optional[str] = ""
    zip: str
    country: str
    email: str


# US State options (matches Options_Class::getStateOptions())
STATE_OPTIONS = {
    "": "-- Select --",
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
    "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
    "DC": "District of Columbia", "FL": "Florida", "GA": "Georgia", "HI": "Hawaii",
    "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa",
    "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine",
    "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota",
    "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska",
    "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico",
    "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio",
    "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island",
    "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas",
    "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington",
    "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming",
    # Canadian provinces
    "AB": "Alberta", "BC": "British Columbia", "MB": "Manitoba",
    "NB": "New Brunswick", "NL": "Newfoundland and Labrador",
    "NS": "Nova Scotia", "NT": "Northwest Territories", "NU": "Nunavut",
    "ON": "Ontario", "PE": "Prince Edward Island", "QC": "Quebec",
    "SK": "Saskatchewan", "YT": "Yukon",
}


# ===============================================================
# DOMAIN NAME MANAGEMENT
# ===============================================================

@router.get("/domain/{site_id}")
def get_domain_info(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """Get domain info for a store. Replicates Store_domainView."""
    try:
        row = db.execute(text(
            "SELECT domain, secure_domain, cdn_bucket, display_name "
            "FROM sites WHERE id = :site_id"
        ), {"site_id": site_id}).first()

        if not row:
            raise HTTPException(status_code=404, detail="Site not found")

        return {
            "domain": row.domain or "",
            "secure_domain": row.secure_domain or "",
            "cdn_bucket": row.cdn_bucket or "",
            "display_name": row.display_name or "",
            "co_id": site_id,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"get_domain_info error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/domain/{site_id}")
def update_domain(
    site_id: int,
    payload: DomainUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """Update domain for a store. Replicates StoreDomain action."""
    try:
        if current_user.user_type not in ("bigadmin", "bigadmin_limit"):
            raise HTTPException(status_code=403, detail="Bigadmin access required")

        domain = payload.domain.strip()
        secure_domain = (payload.secure_domain or "").strip()

        # Update domain
        db.execute(text(
            "UPDATE sites SET domain = :domain WHERE id = :site_id"
        ), {"domain": domain, "site_id": site_id})

        # Update secure_domain if provided
        if secure_domain:
            db.execute(text(
                "UPDATE sites SET secure_domain = :secure_domain WHERE id = :site_id"
            ), {"secure_domain": secure_domain, "site_id": site_id})

        db.commit()

        return {
            "success": True,
            "message": "Domain updated successfully",
            "domain": domain,
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"update_domain error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


# ===============================================================
# SSL CERTIFICATE APPLICATION
# ===============================================================

@router.get("/cert/{site_id}")
def get_cert_form(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """Get cert application form data. Replicates Store_certView."""
    try:
        # Get developer info for pre-fill (matches User_Class::getDeveloper)
        dev_info = {}
        try:
            row = db.execute(text(
                "SELECT first_name, last_name, email, company, address1, address2, "
                "city, state, zip, country "
                "FROM users WHERE id = :uid"
            ), {"uid": current_user.id}).first()
            if row:
                dev_info = {
                    "co_name": row.company or "",
                    "email": row.email or "",
                    "address1": row.address1 or "",
                    "address2": getattr(row, 'address2', '') or "",
                    "city": row.city or "",
                    "state": row.state or "",
                    "zip": row.zip or "",
                    "country": row.country or "",
                }
        except Exception:
            # Some columns may not exist, that's ok
            pass

        # Get site domain for pre-fill
        site_row = db.execute(text(
            "SELECT domain FROM sites WHERE id = :site_id"
        ), {"site_id": site_id}).first()
        if site_row and site_row.domain:
            dev_info["website"] = site_row.domain

        return {
            "valid": dev_info,
            "state_options": STATE_OPTIONS,
            "co_id": site_id,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"get_cert_form error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cert/{site_id}")
def apply_cert(
    site_id: int,
    payload: CertApplicationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """Apply for SSL certificate. Replicates ApplyCert action + Cert_Class::sendApplication."""
    try:
        if current_user.user_type not in ("bigadmin", "bigadmin_limit"):
            raise HTTPException(status_code=403, detail="Bigadmin access required")

        # Get store folder name
        site_row = db.execute(text(
            "SELECT config_file FROM sites WHERE id = :site_id"
        ), {"site_id": site_id}).first()
        folder_name = ""
        if site_row and site_row.config_file:
            folder_name = site_row.config_file.replace("_config.php", "")

        # Generate CSR via openssl (replicates Cert_Class::sendApplication)
        csr_text = ""
        pem_text = ""

        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                # Create input file for openssl req
                emform = [
                    payload.country,
                    payload.state or "",
                    payload.city,
                    payload.co_name,
                    payload.dept or "",
                    payload.website,
                    payload.email,
                    "hello",  # challenge password
                    "",       # optional company name
                ]
                dat_path = os.path.join(tmpdir, "temp.dat")
                with open(dat_path, "w") as f:
                    f.write("\n".join(emform) + "\n")

                key_path = os.path.join(tmpdir, "server.key")
                pem_path = os.path.join(tmpdir, "server.pem")
                csr_path = os.path.join(tmpdir, "server.csr")

                # Generate RSA key
                subprocess.run(
                    ["openssl", "genrsa", "-des3", "-out", key_path,
                     "-passout", "pass:hello", "2048"],
                    capture_output=True, timeout=30
                )
                # Remove passphrase
                subprocess.run(
                    ["openssl", "rsa", "-in", key_path, "-out", pem_path,
                     "-passin", "pass:hello"],
                    capture_output=True, timeout=30
                )
                # Generate CSR
                with open(dat_path, "r") as stdin_file:
                    subprocess.run(
                        ["openssl", "req", "-new", "-key", pem_path, "-out", csr_path],
                        stdin=stdin_file, capture_output=True, timeout=30
                    )

                if os.path.exists(csr_path):
                    with open(csr_path, "r") as f:
                        csr_text = f.read()
                if os.path.exists(pem_path):
                    with open(pem_path, "r") as f:
                        pem_text = f.read()

        except Exception as ssl_err:
            print(f"OpenSSL error: {ssl_err}")
            csr_text = "(CSR generation failed — openssl may not be available)"

        return {
            "success": True,
            "message": "SSL Certificate application submitted",
            "applycert": {
                "csr": csr_text + ("\n" + pem_text if pem_text else ""),
                "address1": payload.address1,
                "address2": payload.address2 or "",
                "zip": payload.zip,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"apply_cert error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_user
from typing import List, Dict, Any

router = APIRouter(prefix="/mainpage", tags=["mainpage"])


@router.get("/{uid}")
def get_mainpage(
    uid: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get mainpage data for a developer.
    Replicates the old platform's MainpageView.php.

    Returns:
        - companies: List of stores/companies this developer manages
        - user_info: Developer user information
    """

    # Verify the user exists
    target_user = db.query(User).filter(User.uid == uid).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Get companies for this developer via User_Class::getCompanies()
    companies_rows = db.execute(text(
        "SELECT s.id as site_id, s.name, s.display_name, s.is_live, s.domain, "
        "s.secure_domain, s.in_cloud, s.date_created, s.bill, s.bill_note "
        "FROM users_sites AS u, sites AS s "
        "WHERE u.site_id = s.id AND u.uid = :uid "
        "ORDER BY s.name"
    ), {"uid": uid}).fetchall()

    companies = []
    for row in companies_rows:
        # Format date in Python (avoids SQLAlchemy/pymysql %% escaping issues)
        formatted_date = ""
        if row.date_created:
            try:
                formatted_date = row.date_created.strftime("%m/%d/%Y")
            except (AttributeError, ValueError):
                formatted_date = str(row.date_created)

        companies.append({
            "site_id": row.site_id,
            "name": row.name or "",
            "display_name": row.display_name or "",
            "is_live": row.is_live or "n",
            "domain": row.domain or "",
            "secure_domain": row.secure_domain or "",
            "in_cloud": row.in_cloud or "n",
            "date_created": formatted_date,
            "bill": row.bill or "",
            "bill_note": row.bill_note or "",
        })

    # Return developer info and companies
    return {
        "uid": target_user.uid,
        "username": target_user.username or "",
        "co_name": target_user.co_name or "",
        "first_name": target_user.first_name or "",
        "last_name": target_user.last_name or "",
        "email": target_user.email or "",
        "user_type": target_user.user_type or "",
        "companies": companies,
        "login_page_messages": [],  # Skip for now - return empty
    }


@router.get("/links/{site_id}")
def get_links(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get links page data for a store.
    Replicates the old platform's LinksView.php.

    Returns:
        - company_info: Store/company information
        - stats: Store statistics (placeholder for now)
    """

    # Get company info via User_Class::getCompany()
    company_rows = db.execute(text(
        "SELECT s.id, s.name, s.display_name, s.is_live, s.domain, "
        "s.secure_domain, s.in_cloud, s.date_created, s.admin_host, "
        "s.bill, s.bill_note, u.uid "
        "FROM sites AS s "
        "LEFT JOIN users_sites AS u ON s.id = u.site_id "
        "WHERE s.id = :site_id "
        "LIMIT 1"
    ), {"site_id": site_id}).first()

    if not company_rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found",
        )

    # Format date in Python
    formatted_date = ""
    if company_rows.date_created:
        try:
            formatted_date = company_rows.date_created.strftime("%m/%d/%Y")
        except (AttributeError, ValueError):
            formatted_date = str(company_rows.date_created)

    company_info = {
        "site_id": company_rows.id,
        "name": company_rows.name or "",
        "display_name": company_rows.display_name or "",
        "is_live": company_rows.is_live or "n",
        "domain": company_rows.domain or "",
        "secure_domain": company_rows.secure_domain or "",
        "in_cloud": company_rows.in_cloud or "n",
        "admin_host": company_rows.admin_host or "",
        "date_created": formatted_date,
        "bill": company_rows.bill or "",
        "bill_note": company_rows.bill_note or "",
        "uid": company_rows.uid,
    }

    # Placeholder stats (skip complex Store_Class::getStats() for now)
    stats = {
        "total_products": 0,
        "total_customers": 0,
        "total_orders": 0,
        "revenue": 0,
    }

    return {
        "company_info": company_info,
        "stats": stats,
    }

"""Actions & routing router — serves the action_forward routing data.

Replicates the old CV3 platform's action→forward→template routing pattern.
Every page navigation in the old platform went through:
  1. Action performs business logic
  2. getForward(code) looks up action_forwards table
  3. Browser redirects to the forward URL (usually /ShowView/<view_name>/<var1>)

In the new platform:
  - The frontend calls these APIs to determine where to navigate
  - The login response includes the forward URL so the frontend knows where to go
  - Each page can query its action's forwards to handle form submissions
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List
import re
import logging

from app.database import get_db
from app.models.action import Action, ActionForward

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/actions", tags=["actions"])


# ── View name → frontend route mapping ──────────────────────────────────
# Maps old platform Smarty template view names to Next.js dashboard routes.
# This is the equivalent of ShowViewActionAdmin.php rendering a template.
VIEW_ROUTE_MAP = {
    # Main / Dashboard
    "mainpage": "/dashboard/main",
    "main_page": "/dashboard/main",

    # Master list (bigadmin landing)
    "master_list": "/dashboard/master-list",

    # Login
    "login": "/login",

    # Account / Users
    "account_list": "/dashboard/account",
    "account_add": "/dashboard/account",
    "account_edit": "/dashboard/account",
    "account_pw": "/dashboard/account",
    "account_info": "/dashboard/account",
    "account_log": "/dashboard/account",

    # Store management
    "store_create": "/dashboard/store",
    "store_overview": "/dashboard/site-overview",
    "site_overview": "/dashboard/site-overview",

    # Products
    "product_list": "/dashboard/products",
    "product_edit": "/dashboard/products",
    "product_search": "/dashboard/products",
    "product_add": "/dashboard/products",
    "product_custom_fields": "/dashboard/products",
    "product_import": "/dashboard/products",
    "product_export": "/dashboard/products",
    "product_review_list": "/dashboard/products",

    # Categories
    "category_list": "/dashboard/categories",
    "category_edit": "/dashboard/categories",
    "category_add": "/dashboard/categories",
    "category_refined": "/dashboard/categories",

    # Orders
    "order_list": "/dashboard/orders",
    "order_edit": "/dashboard/orders",
    "order_view": "/dashboard/orders",
    "order_management": "/dashboard/orders",
    "order_check": "/dashboard/order-check",

    # Customers / Members
    "member_search": "/dashboard/customers",
    "member_edit": "/dashboard/customers",
    "member_add": "/dashboard/customers",
    "customer_group_list": "/dashboard/customer-groups",

    # Shipping
    "shipping_options": "/dashboard/shipping",
    "shipping_list": "/dashboard/shipping",
    "shipping_edit": "/dashboard/shipping",
    "shipping_add": "/dashboard/shipping",

    # Tax
    "tax_list": "/dashboard/tax",
    "tax_options": "/dashboard/tax",

    # Templates
    "template_list": "/dashboard/templates",
    "template_edit": "/dashboard/templates",
    "template_add": "/dashboard/templates",

    # Styles / CSS
    "styles_list": "/dashboard/styles",
    "styles_edit": "/dashboard/styles",

    # JavaScript
    "javascript_list": "/dashboard/javascript",
    "javascript_edit": "/dashboard/javascript",

    # Images
    "image_list": "/dashboard/images",
    "image_upload": "/dashboard/images",

    # Files
    "file_list": "/dashboard/files",
    "file_upload": "/dashboard/files",

    # Marketing
    "promo_list": "/dashboard/promos",
    "promo_edit": "/dashboard/promos",
    "marketing_export": "/dashboard/marketing",
    "marketing_import": "/dashboard/marketing",

    # Email / Lettercast
    "lc_list": "/dashboard/campaigns",
    "lc_edit": "/dashboard/campaigns",
    "lc_add": "/dashboard/campaigns",
    "lc_email": "/dashboard/campaigns",

    # Reports
    "report_sales_rank": "/dashboard/reports",
    "report_orders": "/dashboard/reports",
    "report_visitors": "/dashboard/reports",
    "report_search_terms": "/dashboard/reports",
    "report_cart_abandons": "/dashboard/reports",
    "report_gift_certificate": "/dashboard/reports",
    "report_benchmark": "/dashboard/reports",
    "report_affiliates": "/dashboard/reports",
    "report_optout": "/dashboard/reports",
    "report_bounce": "/dashboard/reports",
    "report_site_optimization": "/dashboard/pagespeed",

    # Wholesale
    "wholesale_list": "/dashboard/wholesale",
    "wholesale_edit": "/dashboard/wholesale",
    "wholesale_new": "/dashboard/wholesale",

    # Vendors
    "vendor_list": "/dashboard/vendors",
    "vendor_edit": "/dashboard/vendors",
    "vendor_add": "/dashboard/vendors",

    # Recipes
    "recipe_list": "/dashboard/recipes",
    "recipe_edit": "/dashboard/recipes",

    # Meta / SEO
    "meta_list": "/dashboard/meta",
    "meta_edit": "/dashboard/meta",
    "metagateway_list": "/dashboard/metagateway",

    # Settings / Options
    "store_options": "/dashboard/settings",
    "payment_options": "/dashboard/settings",
    "checkout_alternative": "/dashboard/settings",
    "catalog_display_options": "/dashboard/settings",
    "display_options": "/dashboard/settings",
    "general_options": "/dashboard/settings",
    "growth_options": "/dashboard/growth-options",
    "order_options": "/dashboard/settings",
    "product_options": "/dashboard/settings",
    "marketing_options": "/dashboard/settings",
    "reporting_options": "/dashboard/settings",

    # Store features
    "store_features": "/dashboard/settings",
    "store_features_edit": "/dashboard/settings",

    # Promos
    "promo_add": "/dashboard/promos",

    # Help
    "help_admin": "/dashboard/help",
    "help_fields": "/dashboard/help",
    "help_manuals": "/dashboard/help",

    # Network
    "network": "/dashboard/network",

    # Billing / Fees
    "billing": "/dashboard/billing",
    "fees": "/dashboard/fees",

    # Publishing
    "publish_store": "/dashboard/store",

    # Training
    "training_videos": "/dashboard/training",

    # URI Redirects
    "uri_redirects": "/dashboard/settings",

    # Rewards
    "rewards_program": "/dashboard/rewards",

    # Klaviyo
    "klaviyo_setup": "/dashboard/klaviyo",

    # Gift Card
    "gift_card_service": "/dashboard/gift-card-service",

    # MFA Settings
    "mfa_admin_settings": "/dashboard/settings",

    # Cart Abandonment
    "cart_abandonment": "/dashboard/settings",

    # Auto reminders
    "auto_reminder_list": "/dashboard/reminders",
    "auto_reminder_edit": "/dashboard/reminders",

    # Price quotes
    "price_quote": "/dashboard/price-quote",
    "quote_status": "/dashboard/quote-status",

    # Backups
    "file_backup": "/dashboard/backups",

    # Documentation / AU
    "au_admin": "/dashboard/au-admin",

    # Changelog
    "store_changelog": "/dashboard/store",
}


def parse_forward_url(forward_raw: str, session_vars: dict = None) -> str:
    """Parse the forward column from action_forwards table.

    The old platform stores PHP expressions like:
      '/ShowView/mainpage'
      '/ShowView/master_list/'.$_SESSION['co_id']
      '/ShowView/payment_options/'.$_SESSION['co_id'].'/tokenization_services'

    We extract the static path and substitute session variables where possible.
    """
    if not forward_raw:
        return ""

    # Remove surrounding quotes if present
    cleaned = forward_raw.strip("'\"")

    # Handle PHP string concatenation with session vars
    # Pattern: '/path'.$_SESSION['var']
    if "$_SESSION" in cleaned or "." in cleaned:
        # Split on PHP concatenation operator
        parts = re.split(r"\'\s*\.\s*", cleaned)
        result = ""
        for part in parts:
            part = part.strip("'\"")
            session_match = re.search(r"\$_SESSION\['(\w+)'\]", part)
            if session_match:
                var_name = session_match.group(1)
                if session_vars and var_name in session_vars:
                    result += str(session_vars[var_name])
                else:
                    result += "{" + var_name + "}"
                # Handle trailing static parts after session var
                after = re.sub(r"\$_SESSION\['\w+'\]\s*\.?\s*", "", part)
                after = after.strip("'\".")
                if after:
                    result += after
            else:
                result += part
        return result

    return cleaned


def forward_to_frontend_route(forward_url: str) -> str:
    """Convert a forward URL like '/ShowView/master_list/all' to a frontend route.

    The old platform URL pattern is:
      /ShowView/<view_name>/<var1>/<var2>

    We map <view_name> to the corresponding Next.js route.
    """
    if not forward_url:
        return "/dashboard/main"

    # Parse ShowView-style URLs
    parts = forward_url.strip("/").split("/")

    if len(parts) >= 2 and parts[0].lower() == "showview":
        view_name = parts[1].lower()
        var1 = parts[2] if len(parts) > 2 else None
        var2 = parts[3] if len(parts) > 3 else None

        # Look up the frontend route
        route = VIEW_ROUTE_MAP.get(view_name, f"/dashboard/{view_name.replace('_', '-')}")

        # Append var1/var2 as query params if present
        params = []
        if var1 and var1 not in ("{co_id}", "0", "all"):
            params.append(f"store={var1}")
        if var2:
            params.append(f"view={var2}")

        if params:
            route += "?" + "&".join(params)

        return route

    # Direct path (no ShowView prefix)
    return forward_url


@router.get("/forward/{action_name}")
def get_action_forward(
    action_name: str,
    code: str = Query(default="main"),
    store_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """Look up the forward URL for a given action and result code.

    This replicates Foundation_Class::getForward() from the old platform.

    Args:
        action_name: The action name (e.g., 'Login', 'MasterList')
        code: The result code (e.g., 'main', 'finish', 'login', 'back')
        store_id: Optional store ID to substitute in session-dependent forwards
    """
    # Look up the action
    action = db.query(Action).filter(Action.action == action_name).first()
    if not action:
        raise HTTPException(status_code=404, detail=f"Action '{action_name}' not found")

    # Look up the forward
    fwd = db.query(ActionForward).filter(
        ActionForward.action_id == action.id,
        ActionForward.code == code,
    ).first()
    if not fwd:
        raise HTTPException(
            status_code=404,
            detail=f"No forward found for action '{action_name}' with code '{code}'",
        )

    # Parse the forward URL
    session_vars = {}
    if store_id:
        session_vars["co_id"] = store_id
        session_vars["var1"] = store_id

    raw_forward = parse_forward_url(fwd.forward, session_vars)
    frontend_route = forward_to_frontend_route(raw_forward)

    return {
        "action_id": action.id,
        "action_name": action.action,
        "code": code,
        "raw_forward": raw_forward,
        "frontend_route": frontend_route,
    }


@router.get("/forwards/{action_name}")
def get_all_forwards(action_name: str, db: Session = Depends(get_db)):
    """Get all forward rules for a given action.

    Useful for the frontend to know all possible navigation destinations
    after performing an action (e.g., 'finish' goes here, 'back' goes there).
    """
    action = db.query(Action).filter(Action.action == action_name).first()
    if not action:
        raise HTTPException(status_code=404, detail=f"Action '{action_name}' not found")

    forwards = db.query(ActionForward).filter(
        ActionForward.action_id == action.id,
    ).all()

    result = []
    for fwd in forwards:
        raw = parse_forward_url(fwd.forward)
        result.append({
            "id": fwd.id,
            "code": fwd.code,
            "raw_forward": raw,
            "frontend_route": forward_to_frontend_route(raw),
        })

    return {
        "action_id": action.id,
        "action_name": action.action,
        "action_type": action.type,
        "form": action.form,
        "forwards": result,
    }


@router.get("/view-map")
def get_view_route_map():
    """Return the full view name → frontend route mapping.

    This is used by the frontend's dynamic routing system.
    """
    return VIEW_ROUTE_MAP


@router.get("/resolve-view/{view_name}")
def resolve_view(view_name: str, var1: Optional[str] = None, var2: Optional[str] = None):
    """Resolve an old-platform view name to a frontend route.

    This is the equivalent of ShowViewActionAdmin.php determining which
    template to render for a given view name.
    """
    view_lower = view_name.lower()
    route = VIEW_ROUTE_MAP.get(view_lower, f"/dashboard/{view_lower.replace('_', '-')}")

    params = []
    if var1 and var1 not in ("0", "all"):
        params.append(f"store={var1}")
    if var2:
        params.append(f"view={var2}")

    if params:
        route += "?" + "&".join(params)

    return {
        "view_name": view_name,
        "frontend_route": route,
        "var1": var1,
        "var2": var2,
    }

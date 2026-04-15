from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_user
from typing import List, Dict, Any
from datetime import datetime, timedelta
import traceback

router = APIRouter(prefix="/mainpage", tags=["mainpage"])


@router.get("/{uid}")
def get_mainpage(
    uid: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get mainpage data for a developer.
    Replicates the old platform's MainpageView.php + User_Class::getCompanies().
    """
    try:
        # Verify the user exists
        target_user = db.query(User).filter(User.uid == uid).first()
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        # Determine if current user is a developer (bigadmin)
        is_bigadmin = current_user.user_type in ('bigadmin', 'bigadmin_limit')
        is_developer = is_bigadmin

        # =====================================================
        # GET MY STORES (developer's own stores)
        # Old platform: users_sites WHERE uid=developer AND (creator_id IS NULL OR creator_id='0')
        # =====================================================
        my_stores = []
        try:
            my_stores_rows = db.execute(text(
                "SELECT s.id AS site_id, s.name, s.display_name, s.is_live, s.domain, "
                "s.secure_domain, s.in_cloud, s.date_created, s.bill, s.bill_note, "
                "s.no_activity, s.no_activity_date, s.config_file "
                "FROM users_sites AS us "
                "JOIN sites AS s ON us.site_id = s.id "
                "WHERE us.uid = :uid "
                "AND (us.creator_id IS NULL OR us.creator_id = '0' OR us.creator_id = 0) "
                "ORDER BY s.name"
            ), {"uid": uid}).fetchall()

            for row in my_stores_rows:
                formatted_date = ""
                if row.date_created:
                    try:
                        formatted_date = row.date_created.strftime("%m/%d/%Y")
                    except (AttributeError, ValueError):
                        formatted_date = str(row.date_created)

                my_stores.append({
                    "id": row.site_id,
                    "name": row.name or "",
                    "display_name": row.display_name or "",
                    "is_live": row.is_live or "n",
                    "status": "Live" if (row.is_live or "n") == "y" else "Development",
                    "domain": row.domain or "",
                    "in_cloud": row.in_cloud or "n",
                    "date_created": formatted_date,
                    "no_activity": row.no_activity or "n",
                    "visitors": 0,
                    "orders": 0,
                    "revenue": "---",
                })
        except Exception as e:
            print(f"Error fetching my_stores for uid {uid}: {e}")

        # =====================================================
        # GET OTHER STORES (stores created by sub-users, linked to developer)
        # Old platform: users_sites WHERE uid=developer AND creator_id IS NOT NULL AND creator_id!='0'
        # Grouped by creator_id (the sub-user uid)
        # =====================================================
        users_data = {}
        other_stores = {}
        other_users = {}

        # Check if user is an admin (has entry in users_admins)
        is_admin_user = False
        try:
            admin_row = db.execute(text(
                "SELECT uid FROM users_admins WHERE uid = :uid LIMIT 1"
            ), {"uid": uid}).first()
            is_admin_user = admin_row is not None
        except Exception:
            pass

        if is_admin_user or is_developer:
            # Get stores created by sub-users (creator_id = sub-user uid)
            try:
                other_stores_rows = db.execute(text(
                    "SELECT s.id AS site_id, s.name, s.display_name, s.is_live, "
                    "s.in_cloud, s.date_created, s.no_activity, s.no_activity_date, "
                    "us.creator_id "
                    "FROM users_sites AS us "
                    "JOIN sites AS s ON us.site_id = s.id "
                    "WHERE us.uid = :uid "
                    "AND us.creator_id IS NOT NULL "
                    "AND us.creator_id != '0' "
                    "AND us.creator_id != 0 "
                    "ORDER BY us.creator_id, s.name"
                ), {"uid": uid}).fetchall()

                # Group by creator_id
                creator_ids = set()
                for row in other_stores_rows:
                    cid = str(row.creator_id)
                    creator_ids.add(cid)
                    if cid not in other_stores:
                        other_stores[cid] = []

                    formatted_date = ""
                    if row.date_created:
                        try:
                            formatted_date = row.date_created.strftime("%m/%d/%Y")
                        except (AttributeError, ValueError):
                            formatted_date = str(row.date_created)

                    other_stores[cid].append({
                        "id": row.site_id,
                        "name": row.name or "",
                        "display_name": row.display_name or "",
                        "status": "Live" if (row.is_live or "n") == "y" else "Development",
                        "in_cloud": row.in_cloud or "n",
                        "date_created": formatted_date,
                        "no_activity": row.no_activity or "n",
                    })
            except Exception as e:
                print(f"Error fetching other_stores for uid {uid}: {e}")

            # Get all associated users (admin_id = developer OR uid = developer)
            # Old platform: SELECT uid, username, co_name, last_login FROM users
            #   WHERE (parent_id='' OR parent_id IS NULL) AND (admin_id=:uid OR uid=:uid)
            #   AND (inactive != 'y' OR inactive IS NULL)
            try:
                users_rows = db.execute(text(
                    "SELECT uid, username, co_name, "
                    "last_login "
                    "FROM users "
                    "WHERE (parent_id = '' OR parent_id IS NULL) "
                    "AND (admin_id = :uid OR uid = :uid) "
                    "AND (inactive != 'y' OR inactive IS NULL) "
                    "ORDER BY username"
                ), {"uid": uid}).fetchall()

                for u in users_rows:
                    formatted_login = ""
                    if u.last_login:
                        try:
                            formatted_login = u.last_login.strftime("%m/%d/%Y %I:%M%p")
                        except (AttributeError, ValueError):
                            formatted_login = str(u.last_login)

                    users_data[str(u.uid)] = {
                        "username": u.username or "",
                        "co_name": u.co_name or "",
                        "user_type": "",
                        "last_login": formatted_login,
                    }
            except Exception as e:
                print(f"Error fetching users for uid {uid}: {e}")

            # Get users without stores (admin_id = developer, not in creator_ids list)
            # Old platform: users WHERE admin_id=:uid AND uid NOT IN (creator_ids)
            try:
                creator_ids_set = set(other_stores.keys())
                if creator_ids_set:
                    # Users with admin_id = developer but no stores
                    no_store_rows = db.execute(text(
                        "SELECT uid FROM users "
                        "WHERE admin_id = :uid "
                        "AND (parent_id IS NULL OR parent_id = '') "
                        "AND (inactive != 'y' OR inactive IS NULL) "
                        "AND uid NOT IN :creator_ids "
                        "ORDER BY username"
                    ), {"uid": uid, "creator_ids": tuple(int(c) for c in creator_ids_set)}).fetchall()
                else:
                    no_store_rows = db.execute(text(
                        "SELECT uid FROM users "
                        "WHERE admin_id = :uid "
                        "AND (parent_id IS NULL OR parent_id = '') "
                        "AND (inactive != 'y' OR inactive IS NULL) "
                        "ORDER BY username"
                    ), {"uid": uid}).fetchall()

                for row in no_store_rows:
                    uid_str = str(row.uid)
                    if uid_str in users_data:
                        other_users[uid_str] = users_data[uid_str]
            except Exception as e:
                print(f"Error fetching other_users for uid {uid}: {e}")

        # Get login page messages
        login_messages = {}
        try:
            msgs_rows = db.execute(text(
                "SELECT message_type, message FROM login_page_messages "
                "WHERE active = 'y'"
            )).fetchall()
            for msg in msgs_rows:
                login_messages[msg.message_type] = msg.message
        except Exception:
            pass

        return {
            "uid": target_user.uid,
            "username": target_user.username or "",
            "co_name": getattr(target_user, 'co_name', '') or "",
            "first_name": getattr(target_user, 'first_name', '') or "",
            "last_name": getattr(target_user, 'last_name', '') or "",
            "email": target_user.email or "",
            "user_type": target_user.user_type or "",
            "devel": is_developer,
            "companies": {
                "my_stores": my_stores,
                "users": users_data,
                "other_stores": other_stores,
                "other_users": other_users,
            },
            "login_messages": login_messages,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Mainpage error for uid {uid}: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@router.get("/links/{site_id}")
def get_links(
    site_id: int,
    all: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get links page data for a store (Store Dashboard).
    Replicates the old platform's LinksView.php exactly.

    Uses TWO databases:
      - db (colorcommerce) for site info, users_sites
      - store_db (cart_{folder}) for orders, products, visitors, etc.
    """
    store_db = None
    try:
        # ---- Central DB: get company info ----
        company_row = db.execute(text(
            "SELECT s.id, s.name, s.display_name, s.is_live, s.domain, "
            "s.secure_domain, s.in_cloud, s.date_created, "
            "s.no_activity, s.no_activity_date, "
            "s.bill, s.bill_note, s.config_file "
            "FROM sites AS s "
            "WHERE s.id = :site_id"
        ), {"site_id": site_id}).first()

        if not company_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found",
            )

        # ---- Connect to per-store database ----
        store_db_name = get_store_db_name(site_id, db)
        if store_db_name:
            try:
                store_db = get_store_session(store_db_name)
            except Exception as e:
                print(f"Could not connect to store db {store_db_name}: {e}")

        # Get owner uid
        owner_row = db.execute(text(
            "SELECT uid FROM users_sites WHERE site_id = :site_id LIMIT 1"
        ), {"site_id": site_id}).first()

        # Format date
        formatted_date = ""
        if company_row.date_created:
            try:
                formatted_date = company_row.date_created.strftime("%m/%d/%Y")
            except (AttributeError, ValueError):
                formatted_date = str(company_row.date_created)

        # Compute expiration date if inactive
        exp_date = ""
        if company_row.no_activity_date and company_row.no_activity in ('y', 'm'):
            try:
                nad = company_row.no_activity_date
                if isinstance(nad, str):
                    nad = datetime.strptime(nad, "%Y-%m-%d")
                exp = nad + timedelta(days=37)
                exp_date = exp.strftime("%B %d, %Y")
            except Exception:
                pass

        company_info = {
            "site_id": company_row.id,
            "name": company_row.name or "",
            "display_name": company_row.display_name or "",
            "is_live": company_row.is_live or "n",
            "domain": company_row.domain or "",
            "secure_domain": company_row.secure_domain or "",
            "in_cloud": company_row.in_cloud or "n",
            "date_created": formatted_date,
            "bill": company_row.bill or "",
            "bill_note": company_row.bill_note or "",
            "uid": owner_row.uid if owner_row else None,
        }

        # =====================================================
        # Store Maintenance Stats — queried from per-store DB
        # =====================================================
        pending_orders = 0
        ws_orders = 0
        catalog_requests = 0
        product_reviews = 0
        active_products = 0
        inactive_products = 0
        live_status = "site not live"

        is_live = (company_row.is_live or "n") == "y"
        if is_live:
            live_status = "templates current"

        if store_db:
            try:
                ord_row = store_db.execute(text(
                    "SELECT COUNT(*) as orders, COALESCE(SUM(total_price), 0) as revenue "
                    "FROM full_order "
                    "WHERE (in_batch IS NULL OR in_batch = '') "
                    "AND (invalid = '' OR invalid IS NULL OR invalid = 'n')"
                )).first()
                if ord_row:
                    pending_orders = ord_row.orders or 0
            except Exception as e:
                print(f"Error querying full_order in {store_db_name}: {e}")

            try:
                ws_row = store_db.execute(text(
                    "SELECT COUNT(*) as orders FROM wholesale_order "
                    "WHERE (in_batch IS NULL OR in_batch = '') "
                    "AND (invalid = '' OR invalid IS NULL)"
                )).first()
                if ws_row:
                    ws_orders = ws_row.orders or 0
            except Exception as e:
                print(f"Error querying wholesale_order in {store_db_name}: {e}")

            try:
                cat_row = store_db.execute(text(
                    "SELECT COUNT(*) as requests FROM catalog_requests WHERE status = 'new'"
                )).first()
                catalog_requests = cat_row.requests if cat_row else 0
            except Exception:
                pass

            try:
                pr_row = store_db.execute(text(
                    "SELECT COUNT(*) as num FROM product_review WHERE approved = 'n'"
                )).first()
                product_reviews = pr_row.num if pr_row else 0
            except Exception:
                pass

            try:
                active_row = store_db.execute(text(
                    "SELECT COUNT(*) as products FROM products "
                    "WHERE ((inactive != 'y' AND inactive != 'd') OR inactive IS NULL) "
                    "AND (is_parent != 'y' OR is_parent IS NULL)"
                )).first()
                inactive_row = store_db.execute(text(
                    "SELECT COUNT(*) as inactive FROM products WHERE inactive = 'y'"
                )).first()
                active_products = active_row.products if active_row else 0
                inactive_products = inactive_row.inactive if inactive_row else 0
            except Exception as e:
                print(f"Error querying products in {store_db_name}: {e}")

        # =====================================================
        # Quick Stats (today/yesterday) — per-store DB
        # =====================================================
        now = datetime.now()
        today_start = now.strftime("%Y-%m-%d") + " 00:00:00"
        yesterday_dt = now - timedelta(days=1)
        yesterday_start = yesterday_dt.strftime("%Y-%m-%d") + " 00:00:00"
        yesterday_end = yesterday_dt.strftime("%Y-%m-%d") + " 23:59:59"

        def _format_stat_period(orders_val, revenue_val, shipping_val, tax_val):
            if not orders_val or orders_val == 0:
                return {
                    "orders": "0", "revenue": "---", "total": "---",
                    "shipping": "---", "avg": "---"
                }
            rev = revenue_val or 0
            ship = shipping_val or 0
            tax = tax_val or 0
            return {
                "orders": str(orders_val),
                "total": f"${rev:,.2f}",
                "revenue": f"${(rev - ship - tax):,.2f}",
                "shipping": f"${(ship + tax):,.2f}",
                "avg": f"${(rev / orders_val):,.2f}",
            }

        today_stats = {"orders": "0", "revenue": "---", "total": "---", "shipping": "---", "avg": "---", "visitors": "0"}
        yesterday_stats = {"orders": "0", "revenue": "---", "total": "---", "shipping": "---", "avg": "---", "visitors": "0"}

        if store_db:
            try:
                today_row = store_db.execute(text(
                    "SELECT COUNT(*) as orders, COALESCE(SUM(total_price),0) as revenue, "
                    "COALESCE(SUM(total_shipping),0) as shipping, COALESCE(SUM(total_tax),0) as tax "
                    "FROM full_order "
                    "WHERE date_ordered >= :today "
                    "AND (invalid != 'y' OR invalid IS NULL)"
                ), {"today": today_start}).first()
                if today_row:
                    today_stats = _format_stat_period(
                        today_row.orders, today_row.revenue, today_row.shipping, today_row.tax
                    )
                    today_stats["visitors"] = "0"
            except Exception:
                pass

            try:
                today_vis_row = store_db.execute(text(
                    "SELECT COUNT(*) as visitors FROM rep_fullclick "
                    "WHERE last_date >= :today AND bot = ''"
                ), {"today": now.strftime("%Y-%m-%d")}).first()
                if today_vis_row:
                    today_stats["visitors"] = str(today_vis_row.visitors or 0)
            except Exception:
                pass

            try:
                yest_row = store_db.execute(text(
                    "SELECT COUNT(*) as orders, COALESCE(SUM(total_price),0) as revenue, "
                    "COALESCE(SUM(total_shipping),0) as shipping, COALESCE(SUM(total_tax),0) as tax "
                    "FROM full_order "
                    "WHERE date_ordered >= :ystart AND date_ordered <= :yend "
                    "AND (invalid != 'y' OR invalid IS NULL)"
                ), {"ystart": yesterday_start, "yend": yesterday_end}).first()
                if yest_row:
                    yesterday_stats = _format_stat_period(
                        yest_row.orders, yest_row.revenue, yest_row.shipping, yest_row.tax
                    )
                    yesterday_stats["visitors"] = "0"
            except Exception:
                pass

            try:
                yest_vis_row = store_db.execute(text(
                    "SELECT SUM(num_visits) as visitors FROM rep_tracker "
                    "WHERE click_date = :ydate"
                ), {"ydate": yesterday_dt.strftime("%Y-%m-%d")}).first()
                if yest_vis_row:
                    yesterday_stats["visitors"] = str(yest_vis_row.visitors or 0)
            except Exception:
                pass

        # =====================================================
        # Extended Stats (month, year, last_month, last_year) — only if all=True
        # Mirrors old platform Store_Class::getStats($id, $all=true)
        # =====================================================
        month_stats = None
        year_stats = None
        last_month_stats = None
        last_year_stats = None

        if all and store_db:
            month_start = now.strftime("%Y-%m") + "-01 00:00:00"
            year_start = now.strftime("%Y") + "-01-01 00:00:00"

            # Last month boundaries
            first_of_this_month = now.replace(day=1)
            last_month_end_dt = first_of_this_month - timedelta(days=1)
            last_month_start_dt = last_month_end_dt.replace(day=1)
            last_month_start = last_month_start_dt.strftime("%Y-%m-%d") + " 00:00:00"
            last_month_end = last_month_end_dt.strftime("%Y-%m-%d") + " 23:59:59"

            # Last year boundaries
            last_year_start = f"{now.year - 1}-01-01 00:00:00"
            last_year_end = f"{now.year - 1}-12-31 23:59:59"

            # --- Month-to-Date ---
            try:
                m_row = store_db.execute(text(
                    "SELECT COUNT(*) as orders, COALESCE(SUM(total_price),0) as revenue, "
                    "COALESCE(SUM(total_shipping),0) as shipping, COALESCE(SUM(total_tax),0) as tax "
                    "FROM full_order "
                    "WHERE date_ordered >= :start AND (invalid != 'y' OR invalid IS NULL)"
                ), {"start": month_start}).first()
                if m_row:
                    month_stats = _format_stat_period(m_row.orders, m_row.revenue, m_row.shipping, m_row.tax)
                    month_stats["visitors"] = "0"
            except Exception:
                pass

            try:
                m_vis_row = store_db.execute(text(
                    "SELECT SUM(num_visits) as visitors FROM rep_tracker WHERE click_date >= :start"
                ), {"start": now.strftime("%Y-%m-01")}).first()
                today_vis = int(today_stats.get("visitors", "0") or "0")
                if m_vis_row and month_stats:
                    month_stats["visitors"] = str((m_vis_row.visitors or 0) + today_vis)
            except Exception:
                pass

            # --- Year-to-Date ---
            try:
                y_row = store_db.execute(text(
                    "SELECT COUNT(*) as orders, COALESCE(SUM(total_price),0) as revenue, "
                    "COALESCE(SUM(total_shipping),0) as shipping, COALESCE(SUM(total_tax),0) as tax "
                    "FROM full_order "
                    "WHERE date_ordered >= :start AND (invalid != 'y' OR invalid IS NULL)"
                ), {"start": year_start}).first()
                if y_row:
                    year_stats = _format_stat_period(y_row.orders, y_row.revenue, y_row.shipping, y_row.tax)
                    year_stats["visitors"] = "0"
            except Exception:
                pass

            try:
                y_vis_row = store_db.execute(text(
                    "SELECT SUM(num_visits) as visitors FROM rep_tracker WHERE click_date >= :start"
                ), {"start": now.strftime("%Y-01-01")}).first()
                today_vis = int(today_stats.get("visitors", "0") or "0")
                if y_vis_row and year_stats:
                    year_stats["visitors"] = str((y_vis_row.visitors or 0) + today_vis)
            except Exception:
                pass

            # --- Last Month ---
            try:
                lm_row = store_db.execute(text(
                    "SELECT COUNT(*) as orders, COALESCE(SUM(total_price),0) as revenue, "
                    "COALESCE(SUM(total_shipping),0) as shipping, COALESCE(SUM(total_tax),0) as tax "
                    "FROM full_order "
                    "WHERE date_ordered >= :start AND date_ordered <= :end "
                    "AND (invalid != 'y' OR invalid IS NULL)"
                ), {"start": last_month_start, "end": last_month_end}).first()
                if lm_row:
                    last_month_stats = _format_stat_period(lm_row.orders, lm_row.revenue, lm_row.shipping, lm_row.tax)
                    last_month_stats["visitors"] = "0"
            except Exception:
                pass

            try:
                lm_vis_row = store_db.execute(text(
                    "SELECT SUM(num_visits) as visitors FROM rep_tracker "
                    "WHERE click_date >= :start AND click_date <= :end"
                ), {"start": last_month_start_dt.strftime("%Y-%m-%d"), "end": last_month_end_dt.strftime("%Y-%m-%d")}).first()
                if lm_vis_row and last_month_stats:
                    last_month_stats["visitors"] = str(lm_vis_row.visitors or 0)
            except Exception:
                pass

            # --- Last Year ---
            try:
                ly_row = store_db.execute(text(
                    "SELECT COUNT(*) as orders, COALESCE(SUM(total_price),0) as revenue, "
                    "COALESCE(SUM(total_shipping),0) as shipping, COALESCE(SUM(total_tax),0) as tax "
                    "FROM full_order "
                    "WHERE date_ordered >= :start AND date_ordered <= :end "
                    "AND (invalid != 'y' OR invalid IS NULL)"
                ), {"start": last_year_start, "end": last_year_end}).first()
                if ly_row:
                    last_year_stats = _format_stat_period(ly_row.orders, ly_row.revenue, ly_row.shipping, ly_row.tax)
                    last_year_stats["visitors"] = "0"
            except Exception:
                pass

            try:
                ly_vis_row = store_db.execute(text(
                    "SELECT SUM(num_visits) as visitors FROM rep_tracker "
                    "WHERE click_date >= :start AND click_date <= :end"
                ), {"start": f"{now.year - 1}-01-01", "end": f"{now.year - 1}-12-31"}).first()
                if ly_vis_row and last_year_stats:
                    last_year_stats["visitors"] = str(ly_vis_row.visitors or 0)
            except Exception:
                pass

        # New Features — from per-store DB
        new_features = []
        if store_db:
            try:
                feat_rows = store_db.execute(text(
                    "SELECT title, description FROM feature_descriptions "
                    "WHERE dashboard = 'y' AND live = 'y' "
                    "ORDER BY date_entered DESC"
                )).fetchall()
                for f in feat_rows:
                    new_features.append({
                        "title": f.title or "",
                        "description": f.description or "",
                    })
            except Exception:
                pass

        return {
            "company_info": company_info,
            "exp_date": exp_date,
            "store_db": store_db_name or "not found",
            "stats": {
                "status": live_status,
                "orders": pending_orders,
                "ws_orders": ws_orders,
                "catalogs": catalog_requests,
                "product_reviews": product_reviews,
                "active": active_products,
                "inactive": inactive_products,
                "today": today_stats,
                "yesterday": yesterday_stats,
                **({"month": month_stats} if month_stats else {}),
                **({"year": year_stats} if year_stats else {}),
                **({"last_month": last_month_stats} if last_month_stats else {}),
                **({"last_year": last_year_stats} if last_year_stats else {}),
            },
            "new_features": new_features,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Links error for site_id {site_id}: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )
    finally:
        if store_db:
            store_db.close()

"""
Store Changelog & Diff router — replicates old platform's store_changelog
and store_diff pages.

Changelog uses per-store DB (change_log table).
Diff compares staging vs live template/file directories on the filesystem.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_user, get_current_admin_user
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
import traceback
import subprocess
import os

router = APIRouter(prefix="/store-changelog", tags=["store-changelog"])

# Root path for store template/file directories
STORE_FILES_ROOT = "/Users/kashishpanwar/Documents/next-gen-platform/old-platform/ministeam templates and files"

# Root paths for new platform source files
NEXTJS_FRONTEND_SRC = "/Users/kashishpanwar/Documents/next-gen-platform/next-gen/frontend/src"
BACKEND_SRC = "/Users/kashishpanwar/Documents/next-gen-platform/next-gen/backend/app"


class ChangelogSearchParams(BaseModel):
    user: Optional[str] = ""
    log_action: Optional[str] = ""
    last: Optional[int] = 30


class DiffRequest(BaseModel):
    filename: str


class GrepRequest(BaseModel):
    search_term: str


# -------------------------------------------------------
# Helper: get store folder name from site_id
# -------------------------------------------------------
def _get_store_folder(site_id: int, db: Session) -> str:
    """Get store folder name from config_file in sites table."""
    row = db.execute(text(
        "SELECT config_file FROM sites WHERE id = :site_id"
    ), {"site_id": site_id}).first()
    if not row or not row.config_file:
        return ""
    # config_file is like 'ministeam_config.php' -> folder = 'ministeam'
    return row.config_file.replace("_config.php", "")


# -------------------------------------------------------
# GET /store-changelog/log/{site_id}
# Replicates Store_changelogView + Log_Class::get()
# Queries change_log table in per-store DB
# -------------------------------------------------------
@router.get("/log/{site_id}")
def get_changelog(
    site_id: int,
    user_filter: Optional[str] = "",
    action_filter: Optional[str] = "",
    last: Optional[int] = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Get store changelog with optional filters."""
    store_db = None
    try:
        is_bigadmin = current_user.user_type in ("bigadmin", "bigadmin_limit")

        # Connect to per-store database
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store database not found")

        store_db = get_store_session(store_db_name)

        # Build query with optional filters (replicates Log_Class::get)
        where_clauses = []
        params: Dict[str, Any] = {}

        if user_filter:
            where_clauses.append("user_id = :user_filter")
            params["user_filter"] = user_filter

        if action_filter:
            where_clauses.append("action = :action_filter")
            params["action_filter"] = action_filter

        query = (
            "SELECT user_id, action, specific_information, "
            "difference, date AS ndate "
            "FROM change_log"
        )
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
        query += " ORDER BY date DESC"
        if last and last > 0:
            query += f" LIMIT {int(last)}"

        log_rows = store_db.execute(text(query), params).fetchall()

        log = []
        for r in log_rows:
            ndate_str = ""
            if r.ndate:
                try:
                    ndate_str = r.ndate.strftime("%m/%d/%Y %I:%M %p")
                except (AttributeError, ValueError):
                    ndate_str = str(r.ndate)

            log.append({
                "user_id": r.user_id or "",
                "action": r.action or "",
                "specific_information": r.specific_information or "",
                "difference": r.difference or "",
                "ndate": ndate_str,
            })

        # Get distinct users from change_log (replicates Log_Class::getUsers)
        user_id_rows = store_db.execute(text(
            "SELECT DISTINCT user_id FROM change_log"
        )).fetchall()

        user_ids = [str(r.user_id) for r in user_id_rows if r.user_id]
        users = {}
        if user_ids:
            # Look up usernames from central DB
            try:
                placeholders = ",".join(f":uid{i}" for i in range(len(user_ids)))
                uid_params = {f"uid{i}": uid for i, uid in enumerate(user_ids)}
                user_rows = db.execute(text(
                    f"SELECT uid, username FROM users WHERE uid IN ({placeholders}) "
                    "ORDER BY username"
                ), uid_params).fetchall()
                for u in user_rows:
                    users[str(u.uid)] = u.username or str(u.uid)
            except Exception as e:
                print(f"Error looking up usernames: {e}")
                for uid in user_ids:
                    users[uid] = uid

        # Get distinct actions (replicates Log_Class::getActions)
        action_rows = store_db.execute(text(
            "SELECT DISTINCT action FROM change_log ORDER BY action"
        )).fetchall()
        actions = {r.action: r.action for r in action_rows if r.action}

        # Get store settings for log_difference flag
        log_difference = "n"
        try:
            settings_row = store_db.execute(text(
                "SELECT value FROM settings WHERE name = 'log_difference'"
            )).first()
            if settings_row:
                log_difference = settings_row.value or "n"
        except Exception:
            pass

        return {
            "log": log,
            "users": users,
            "actions": actions,
            "search": {
                "user": user_filter or "",
                "log_action": action_filter or "",
                "last": str(last) if last else "30",
            },
            "bigadmin": "y" if is_bigadmin else "n",
            "log_difference": log_difference,
            "co_id": site_id,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"get_changelog error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


# -------------------------------------------------------
# GET /store-changelog/diff-filelist/{site_id}
# Replicates Store_diffView — gets list of template/code files
# -------------------------------------------------------
@router.get("/diff-filelist/{site_id}")
def get_diff_filelist(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """Get list of template and code files available for diff."""
    store_db = None
    try:
        is_bigadmin = current_user.user_type in ("bigadmin", "bigadmin_limit")
        if not is_bigadmin:
            raise HTTPException(status_code=403, detail="Bigadmin access required")

        store_folder = _get_store_folder(site_id, db)
        if not store_folder:
            raise HTTPException(status_code=404, detail="Store folder not found")

        # Also try to get file list from per-store DB (Template_Class::getTemplateList)
        filelist: Dict[str, str] = {}

        store_db_name = get_store_db_name(site_id, db)
        if store_db_name:
            try:
                store_db = get_store_session(store_db_name)
                tpl_rows = store_db.execute(text(
                    "SELECT name FROM templates ORDER BY name"
                )).fetchall()
                for r in tpl_rows:
                    if r.name:
                        filelist[r.name] = r.name
            except Exception as e:
                print(f"Error getting template list from DB: {e}")

        # Also scan filesystem for templates and files_code
        templates_dir = os.path.join(STORE_FILES_ROOT, store_folder, "templates")
        files_code_dir = os.path.join(STORE_FILES_ROOT, store_folder, "files_code")

        for d in [templates_dir, files_code_dir]:
            if os.path.isdir(d):
                for fname in sorted(os.listdir(d)):
                    if os.path.isfile(os.path.join(d, fname)):
                        filelist[fname] = fname

        # Sort by filename
        sorted_filelist = dict(sorted(filelist.items(), key=lambda x: x[1]))

        return {
            "filelist": sorted_filelist,
            "store_folder": store_folder,
            "co_id": site_id,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"get_diff_filelist error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


# -------------------------------------------------------
# POST /store-changelog/diff/{site_id}
# Replicates Store_Class::storeDiff() — runs diff between
# staging and live versions of a file
# -------------------------------------------------------
@router.post("/diff/{site_id}")
def get_diff(
    site_id: int,
    payload: DiffRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
) -> Dict[str, str]:
    """Get diff between staging and live version of a file."""
    try:
        is_bigadmin = current_user.user_type in ("bigadmin", "bigadmin_limit")
        if not is_bigadmin:
            raise HTTPException(status_code=403, detail="Bigadmin access required")

        filename = payload.filename

        # Security: prevent directory traversal
        if ".." in filename:
            raise HTTPException(status_code=400, detail="Folder level traversing is prohibited")

        store_folder = _get_store_folder(site_id, db)
        if not store_folder:
            raise HTTPException(status_code=404, detail="Store folder not found")

        base_path = os.path.join(STORE_FILES_ROOT, store_folder)

        # Determine paths based on file type (same logic as old platform)
        if filename.endswith(".tpl"):
            staging_path = os.path.join(base_path, "templates", filename)
            live_path = os.path.join(base_path, "templates_live", filename)
        else:
            staging_path = os.path.join(base_path, "files_code", filename)
            live_path = os.path.join(base_path, "files_code_live", filename)

        # Check if files exist
        if not os.path.isfile(staging_path) and not os.path.isfile(live_path):
            return {"diff": f"File not found: {filename}"}

        if not os.path.isfile(staging_path):
            return {"diff": f"Staging file not found: {filename}"}

        if not os.path.isfile(live_path):
            return {"diff": f"Live file not found: {filename} (no live version exists)"}

        # Run diff command
        try:
            result = subprocess.run(
                ["diff", staging_path, live_path],
                capture_output=True,
                text=True,
                timeout=10,
            )
            diff_output = result.stdout
        except subprocess.TimeoutExpired:
            return {"diff": "Diff timed out"}
        except Exception as e:
            return {"diff": f"Error running diff: {str(e)}"}

        if diff_output:
            return {"diff": diff_output}
        else:
            return {"diff": "No Differences Found Between Staging and Live"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"get_diff error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------------------------------
# POST /store-changelog/grep/{site_id}
# Replicates Store_Class::storeGREP() — searches templates
# and files_code directories for a search term
# -------------------------------------------------------
@router.post("/grep/{site_id}")
def store_grep(
    site_id: int,
    payload: GrepRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """Search store template and code files for a term. Replicates storeGREP."""
    try:
        is_bigadmin = current_user.user_type in ("bigadmin", "bigadmin_limit")
        if not is_bigadmin:
            raise HTTPException(status_code=403, detail="Bigadmin access required")

        search_term = payload.search_term.strip()
        if not search_term:
            raise HTTPException(status_code=400, detail="Search term is required")

        # Security: prevent shell injection — subprocess with list args is safe,
        # but also reject obviously malicious patterns
        if ".." in search_term:
            raise HTTPException(status_code=400, detail="Invalid search term")

        # Only search the new platform frontend source files
        search_dirs = []
        if os.path.isdir(NEXTJS_FRONTEND_SRC):
            search_dirs.append(NEXTJS_FRONTEND_SRC)

        results: List[Dict[str, Any]] = []

        for search_dir in search_dirs:
            if not os.path.isdir(search_dir):
                continue

            try:
                # Use grep -rn for line numbers and content (case-insensitive)
                proc = subprocess.run(
                    ["grep", "-rni", "--include=*", search_term, search_dir],
                    capture_output=True,
                    text=True,
                    timeout=30,
                )
                # grep returns exit code 1 if no matches — that's ok
                if proc.stdout:
                    for line in proc.stdout.strip().split("\n"):
                        if not line:
                            continue
                        # Format: /full/path/to/file:line_number:content
                        parts = line.split(":", 2)
                        if len(parts) >= 3:
                            filepath = parts[0]
                            line_num = parts[1]
                            content = parts[2]
                            # Show relative path from search_dir so files
                            # like page.tsx are distinguishable by their folder
                            rel_path = os.path.relpath(filepath, search_dir)
                            try:
                                line_num_int = int(line_num)
                            except ValueError:
                                line_num_int = 0
                            results.append({
                                "file": rel_path,
                                "line_number": line_num_int,
                                "content": content.strip(),
                            })
            except subprocess.TimeoutExpired:
                pass
            except Exception as e:
                print(f"grep error in {search_dir}: {e}")

        return {
            "data": results[:50],
            "count": len(results),
            "search_term": search_term,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"store_grep error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

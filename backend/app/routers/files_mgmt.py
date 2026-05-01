from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_user, get_current_admin_user

router = APIRouter(prefix="/files", tags=["files"])


@router.get("")
@router.get("/list")
def list_files(
    site_id: int = Query(..., description="Store ID"),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List store files."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")

        store_db = get_store_session(store_db_name)

        # Try to find a files table
        table_name = None
        for tbl in ["files", "site_files", "file_library", "uploads", "documents"]:
            try:
                store_db.execute(text(f"SELECT 1 FROM {tbl} LIMIT 1"))
                table_name = tbl
                break
            except Exception:
                continue

        if not table_name:
            return {"data": [], "total": 0, "message": "No files table found"}

        cols = [r[0] for r in store_db.execute(text(f"SHOW COLUMNS FROM {table_name}")).fetchall()]

        id_col = next((c for c in cols if c in ["id", "file_id"]), cols[0])
        name_col = next((c for c in cols if c in ["name", "filename", "file_name", "title"]), None)
        path_col = next((c for c in cols if c in ["path", "file_path", "url"]), None)
        size_col = next((c for c in cols if c in ["size", "file_size"]), None)
        date_col = next((c for c in cols if c in ["created_at", "date_created", "upload_date", "date_added"]), None)

        select_cols = [id_col]
        if name_col:
            select_cols.append(name_col)
        if path_col:
            select_cols.append(path_col)
        if size_col:
            select_cols.append(size_col)
        if date_col:
            select_cols.append(date_col)

        where_clause = ""
        params = {}
        if search and name_col:
            where_clause = f"WHERE {name_col} LIKE :search"
            params["search"] = f"%{search}%"

        count_query = f"SELECT COUNT(*) FROM {table_name} {where_clause}"
        total = store_db.execute(text(count_query), params).scalar() or 0

        offset = (page - 1) * page_size
        query = f"SELECT {', '.join(select_cols)} FROM {table_name} {where_clause} ORDER BY {id_col} DESC LIMIT :limit OFFSET :offset"
        params["limit"] = page_size
        params["offset"] = offset

        rows = store_db.execute(text(query), params).fetchall()
        items = []
        for row in rows:
            item = {"id": str(getattr(row, id_col))}
            if name_col:
                item["name"] = getattr(row, name_col, "") or ""
            if path_col:
                item["path"] = getattr(row, path_col, "") or ""
            if size_col:
                item["size"] = str(getattr(row, size_col, "")) if getattr(row, size_col, None) else ""
            if date_col:
                item["created_at"] = str(getattr(row, date_col, "")) if getattr(row, date_col, None) else ""
            items.append(item)

        return {"data": items, "total": total, "page": page, "page_size": page_size}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()


@router.delete("/{file_id}")
def delete_file(
    file_id: int = Path(...),
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete a file."""
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")

        store_db = get_store_session(store_db_name)

        table_name = None
        for tbl in ["files", "site_files", "file_library", "uploads", "documents"]:
            try:
                store_db.execute(text(f"SELECT 1 FROM {tbl} LIMIT 1"))
                table_name = tbl
                break
            except Exception:
                continue

        if not table_name:
            raise HTTPException(status_code=404, detail="Files table not found")

        cols = [r[0] for r in store_db.execute(text(f"SHOW COLUMNS FROM {table_name}")).fetchall()]
        id_col = next((c for c in cols if c in ["id", "file_id"]), cols[0])

        store_db.execute(text(f"DELETE FROM {table_name} WHERE {id_col} = :id"), {"id": file_id})
        store_db.commit()

        return {"message": "File deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if store_db:
            store_db.close()

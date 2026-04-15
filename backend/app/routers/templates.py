"""
Template Management Router
Handles template (.tpl), CSS/JS, and store configuration files for the old platform data.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, List, Dict
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_user
from datetime import datetime
import os
import re
from pathlib import Path as PathlibPath

router = APIRouter(prefix="/templates", tags=["templates"])

# Configuration
STORE_FILES_ROOT = "/Users/kashishpanwar/Documents/next-gen-platform/old-platform/ministeam templates and files"
DEFAULT_CATEGORIES = [
    "Site Design",
    "User Defined",
    "Catalog Display",
    "Contact Form",
    "Member",
    "Checkout",
    "Recipe",
    "Wholesale",
    "Custom Product Form",
    "Generic Form",
    "Email Confirmation",
    "Miscellaneous",
    "CSS Stylesheets",
    "JavaScript Files",
    "Other Files",
]


# ====== Pydantic Models ======

class TemplateListItem(BaseModel):
    name: str
    filename: str
    common_name: str
    category: str
    last_modified: Optional[str]
    locked: bool
    locked_by: Optional[int]
    type: str

    class Config:
        from_attributes = True


class TemplateListResponse(BaseModel):
    categories: Dict[str, List[TemplateListItem]]


class TemplateContentResponse(BaseModel):
    content: str
    filename: str
    common_name: str
    category: str
    meta_title: Optional[str]
    meta_description: Optional[str]
    meta_keywords: Optional[str]
    locked: bool
    locked_by: Optional[int]
    type: str


class TemplateSaveRequest(BaseModel):
    filename: str
    content: str
    common_name: str
    category: str
    type: str = "tpl"
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None


class TemplateCreateRequest(BaseModel):
    filename: str
    content: str
    common_name: str
    category: str
    type: str = "tpl"


class TemplateLockRequest(BaseModel):
    filename: str
    lock: bool
    user_id: int


class StoreConfigResponse(BaseModel):
    config: Dict[str, str]


class StoreConfigUpdateRequest(BaseModel):
    config: Dict[str, str]


# ====== Helper Functions ======

def get_file_path(filename: str, file_type: str) -> str:
    """Get the full file path based on type."""
    if file_type == "css":
        return os.path.join(STORE_FILES_ROOT, "files_code", filename)
    elif file_type == "js":
        return os.path.join(STORE_FILES_ROOT, "files_code", filename)
    elif file_type == "other":
        return os.path.join(STORE_FILES_ROOT, "files_code", filename)
    else:  # tpl
        return os.path.join(STORE_FILES_ROOT, "templates", filename)


def get_file_type_from_filename(filename: str) -> str:
    """Determine file type from filename."""
    if filename.endswith("_edit.css"):
        return "css"
    elif filename.endswith(".js") and not filename.endswith("_bak.js"):
        return "js"
    elif filename.endswith(".tpl"):
        return "tpl"
    else:
        return "other"


def get_file_last_modified(filepath: str) -> Optional[str]:
    """Get the last modified timestamp of a file."""
    try:
        if os.path.exists(filepath):
            mtime = os.path.getmtime(filepath)
            return datetime.fromtimestamp(mtime).isoformat()
    except Exception:
        pass
    return None


def parse_store_conf(conf_path: str) -> Dict[str, str]:
    """Parse store.conf file and return key-value pairs."""
    config = {}
    try:
        if os.path.exists(conf_path):
            with open(conf_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#"):
                        # Format: key = "value"
                        match = re.match(r'(\w+)\s*=\s*"([^"]*)"', line)
                        if match:
                            key, value = match.groups()
                            config[key] = value
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read store.conf: {str(e)}"
        )
    return config


def write_store_conf(conf_path: str, config: Dict[str, str]):
    """Write key-value pairs to store.conf file."""
    try:
        lines = []
        for key, value in config.items():
            lines.append(f'{key} = "{value}"')

        with open(conf_path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
            if lines:
                f.write("\n")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to write store.conf: {str(e)}"
        )


def parse_template_includes(content: str) -> List[str]:
    """Extract included template filenames from {include file=...} directives."""
    pattern = r'\{\s*include\s+file\s*=\s*["\']?([^\s"\'}\]]+)["\']?\s*\}'
    matches = re.findall(pattern, content)
    return matches


def get_template_metadata(store_session: Session, filename: str) -> Dict:
    """Get template metadata from database."""
    metadata = {
        "common_name": filename,
        "category": "Miscellaneous",
        "meta_title": None,
        "meta_description": None,
        "meta_keywords": None,
    }

    try:
        # Try template_names first
        query = text("""
            SELECT template_name, category FROM template_names
            WHERE template = :filename LIMIT 1
        """)
        result = store_session.execute(query, {"filename": filename}).first()

        if result:
            metadata["common_name"] = result.template_name or filename
            metadata["category"] = result.category or "Miscellaneous"
        else:
            # Try template_names_main
            query = text("""
                SELECT template_name, category FROM template_names_main
                WHERE template = :filename LIMIT 1
            """)
            result = store_session.execute(query, {"filename": filename}).first()
            if result:
                metadata["common_name"] = result.template_name or filename
                metadata["category"] = result.category or "Miscellaneous"

        # Get metadata details
        query = text("""
            SELECT title, description, keywords FROM template_meta
            WHERE template = :filename LIMIT 1
        """)
        result = store_session.execute(query, {"filename": filename}).first()

        if result:
            metadata["meta_title"] = result.title
            metadata["meta_description"] = result.description
            metadata["meta_keywords"] = result.keywords

    except Exception:
        pass

    return metadata


def get_lock_status(store_session: Session, filename: str) -> tuple:
    """Get lock status for a template."""
    try:
        query = text("""
            SELECT locked_by, locked_on FROM template_lock
            WHERE template = :filename LIMIT 1
        """)
        result = store_session.execute(query, {"filename": filename}).first()

        if result and result.locked_by:
            return (True, result.locked_by)
    except Exception:
        pass

    return (False, None)


def list_files_in_directory(directory: str, extension: str = "") -> List[str]:
    """List files in a directory with optional extension filter."""
    files = []
    try:
        if os.path.isdir(directory):
            for filename in os.listdir(directory):
                filepath = os.path.join(directory, filename)
                if os.path.isfile(filepath):
                    if not extension or filename.endswith(extension):
                        files.append(filename)
    except Exception:
        pass
    return sorted(files)


# ====== Endpoints ======

@router.get("/list", response_model=TemplateListResponse)
def list_templates(
    site_id: int = Query(..., description="Store ID"),
    type: str = Query("", description="File type: '' (tpl), 'css', 'js', 'other'"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all templates grouped by category.
    - type="" (default): .tpl template files
    - type="css": CSS files (files ending in _edit.css in files_code/)
    - type="js": JS files (files ending in .js in files_code/, excluding _bak.js)
    - type="other": Other files (robots.txt, etc.)
    """
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        store_db = get_store_session(store_db_name)

        # Determine which files to list
        templates_dir = os.path.join(STORE_FILES_ROOT, "templates")
        files_code_dir = os.path.join(STORE_FILES_ROOT, "files_code")

        file_list = []

        if type == "css":
            files = list_files_in_directory(files_code_dir, "_edit.css")
            for filename in files:
                file_list.append(("css", filename))
        elif type == "js":
            files = list_files_in_directory(files_code_dir, ".js")
            file_list.extend([("js", f) for f in files if not f.endswith("_bak.js")])
        elif type == "other":
            files = list_files_in_directory(files_code_dir)
            for filename in files:
                if not filename.endswith("_edit.css") and not filename.endswith(".js"):
                    file_list.append(("other", filename))
        else:  # Default to .tpl
            files = list_files_in_directory(templates_dir, ".tpl")
            file_list.extend([("tpl", f) for f in files])

        # Build response grouped by category
        categories: Dict[str, List[TemplateListItem]] = {cat: [] for cat in DEFAULT_CATEGORIES}

        for file_type, filename in file_list:
            filepath = get_file_path(filename, file_type)
            metadata = get_template_metadata(store_db, filename)
            locked, locked_by = get_lock_status(store_db, filename)

            item = TemplateListItem(
                name=filename,
                filename=filename,
                common_name=metadata["common_name"],
                category=metadata["category"],
                last_modified=get_file_last_modified(filepath),
                locked=locked,
                locked_by=locked_by,
                type=file_type,
            )

            cat = metadata["category"]
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(item)

        # Remove empty categories
        categories = {k: v for k, v in categories.items() if v}

        return TemplateListResponse(categories=categories)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list templates: {str(e)}"
        )
    finally:
        if store_db:
            store_db.close()


@router.get("/content", response_model=TemplateContentResponse)
def get_template_content(
    site_id: int = Query(..., description="Store ID"),
    filename: str = Query(..., description="Template filename"),
    type: str = Query("", description="File type: '' (tpl), 'css', 'js', 'other'"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get template content and metadata.
    """
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        store_db = get_store_session(store_db_name)

        filepath = get_file_path(filename, type)

        if not os.path.exists(filepath):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template file not found: {filename}"
            )

        # Read file content
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to read template: {str(e)}"
            )

        metadata = get_template_metadata(store_db, filename)
        locked, locked_by = get_lock_status(store_db, filename)

        return TemplateContentResponse(
            content=content,
            filename=filename,
            common_name=metadata["common_name"],
            category=metadata["category"],
            meta_title=metadata["meta_title"],
            meta_description=metadata["meta_description"],
            meta_keywords=metadata["meta_keywords"],
            locked=locked,
            locked_by=locked_by,
            type=type,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get template content: {str(e)}"
        )
    finally:
        if store_db:
            store_db.close()


@router.put("/content", response_model=dict)
def save_template_content(
    site_id: int = Query(..., description="Store ID"),
    request: TemplateSaveRequest = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Save template content and metadata.
    Updates both filesystem and database.
    """
    store_db = None
    try:
        if not request:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Request body is required"
            )

        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        store_db = get_store_session(store_db_name)

        filepath = get_file_path(request.filename, request.type)

        # Ensure directory exists
        directory = os.path.dirname(filepath)
        try:
            os.makedirs(directory, exist_ok=True)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create directory: {str(e)}"
            )

        # Write content to file
        try:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(request.content)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to write template: {str(e)}"
            )

        # Update template_names (upsert)
        try:
            # Check if exists
            query = text("""
                SELECT id FROM template_names WHERE template = :filename LIMIT 1
            """)
            result = store_db.execute(query, {"filename": request.filename}).first()

            if result:
                # Update
                update_query = text("""
                    UPDATE template_names
                    SET template_name = :common_name, category = :category, type = :type
                    WHERE template = :filename
                """)
                store_db.execute(update_query, {
                    "common_name": request.common_name,
                    "category": request.category,
                    "type": request.type[0] if request.type else "t",
                    "filename": request.filename,
                })
            else:
                # Insert
                insert_query = text("""
                    INSERT INTO template_names (template, template_name, category, type)
                    VALUES (:filename, :common_name, :category, :type)
                """)
                store_db.execute(insert_query, {
                    "filename": request.filename,
                    "common_name": request.common_name,
                    "category": request.category,
                    "type": request.type[0] if request.type else "t",
                })

            store_db.commit()
        except Exception as e:
            store_db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update template_names: {str(e)}"
            )

        # Update template_meta (upsert)
        if request.meta_title or request.meta_description or request.meta_keywords:
            try:
                query = text("""
                    SELECT id FROM template_meta WHERE template = :filename LIMIT 1
                """)
                result = store_db.execute(query, {"filename": request.filename}).first()

                if result:
                    update_query = text("""
                        UPDATE template_meta
                        SET title = :title, description = :description, keywords = :keywords
                        WHERE template = :filename
                    """)
                    store_db.execute(update_query, {
                        "title": request.meta_title,
                        "description": request.meta_description,
                        "keywords": request.meta_keywords,
                        "filename": request.filename,
                    })
                else:
                    insert_query = text("""
                        INSERT INTO template_meta (template, title, description, keywords)
                        VALUES (:filename, :title, :description, :keywords)
                    """)
                    store_db.execute(insert_query, {
                        "filename": request.filename,
                        "title": request.meta_title,
                        "description": request.meta_description,
                        "keywords": request.meta_keywords,
                    })

                store_db.commit()
            except Exception as e:
                store_db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to update template_meta: {str(e)}"
                )

        # Parse and update template_includes
        try:
            includes = parse_template_includes(request.content)
            if includes:
                included_str = "|".join(includes)

                query = text("""
                    SELECT id FROM template_includes WHERE template_name = :filename LIMIT 1
                """)
                result = store_db.execute(query, {"filename": request.filename}).first()

                if result:
                    update_query = text("""
                        UPDATE template_includes
                        SET included = :included
                        WHERE template_name = :filename
                    """)
                    store_db.execute(update_query, {
                        "included": included_str,
                        "filename": request.filename,
                    })
                else:
                    insert_query = text("""
                        INSERT INTO template_includes (template_name, included)
                        VALUES (:filename, :included)
                    """)
                    store_db.execute(insert_query, {
                        "filename": request.filename,
                        "included": included_str,
                    })

                store_db.commit()
        except Exception as e:
            store_db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update template_includes: {str(e)}"
            )

        return {
            "success": True,
            "filename": request.filename,
            "message": "Template saved successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save template: {str(e)}"
        )
    finally:
        if store_db:
            store_db.close()


@router.post("/create", response_model=dict)
def create_template(
    site_id: int = Query(..., description="Store ID"),
    request: TemplateCreateRequest = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new template file and database entry.
    """
    store_db = None
    try:
        if not request:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Request body is required"
            )

        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        store_db = get_store_session(store_db_name)

        filepath = get_file_path(request.filename, request.type)

        # Check if file already exists
        if os.path.exists(filepath):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Template file already exists: {request.filename}"
            )

        # Ensure directory exists
        directory = os.path.dirname(filepath)
        try:
            os.makedirs(directory, exist_ok=True)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create directory: {str(e)}"
            )

        # Write content to file
        try:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(request.content)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create template: {str(e)}"
            )

        # Insert into template_names
        try:
            insert_query = text("""
                INSERT INTO template_names (template, template_name, category, type)
                VALUES (:filename, :common_name, :category, :type)
            """)
            store_db.execute(insert_query, {
                "filename": request.filename,
                "common_name": request.common_name,
                "category": request.category,
                "type": request.type[0] if request.type else "t",
            })
            store_db.commit()
        except Exception as e:
            store_db.rollback()
            # Try to remove the file since DB insert failed
            try:
                os.remove(filepath)
            except Exception:
                pass
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create template record: {str(e)}"
            )

        return {
            "success": True,
            "filename": request.filename,
            "message": "Template created successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create template: {str(e)}"
        )
    finally:
        if store_db:
            store_db.close()


@router.delete("/{filename}")
def delete_template(
    filename: str = Path(..., description="Template filename"),
    site_id: int = Query(..., description="Store ID"),
    type: str = Query("", description="File type: '' (tpl), 'css', 'js', 'other'"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a template file and its database entries.
    """
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        store_db = get_store_session(store_db_name)

        filepath = get_file_path(filename, type)

        if not os.path.exists(filepath):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template file not found: {filename}"
            )

        # Remove file from disk
        try:
            os.remove(filepath)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete template file: {str(e)}"
            )

        # Remove from database tables
        try:
            # Delete from template_names
            delete_query = text("DELETE FROM template_names WHERE template = :filename")
            store_db.execute(delete_query, {"filename": filename})

            # Delete from template_meta
            delete_query = text("DELETE FROM template_meta WHERE template = :filename")
            store_db.execute(delete_query, {"filename": filename})

            # Delete from template_lock
            delete_query = text("DELETE FROM template_lock WHERE template = :filename")
            store_db.execute(delete_query, {"filename": filename})

            # Delete from template_includes
            delete_query = text("DELETE FROM template_includes WHERE template_name = :filename")
            store_db.execute(delete_query, {"filename": filename})

            store_db.commit()
        except Exception as e:
            store_db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete template records: {str(e)}"
            )

        return {
            "success": True,
            "filename": filename,
            "message": "Template deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete template: {str(e)}"
        )
    finally:
        if store_db:
            store_db.close()


@router.post("/lock", response_model=dict)
def lock_template(
    site_id: int = Query(..., description="Store ID"),
    request: TemplateLockRequest = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Lock or unlock a template.
    """
    store_db = None
    try:
        if not request:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Request body is required"
            )

        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        store_db = get_store_session(store_db_name)

        try:
            if request.lock:
                # Check if already locked
                query = text("""
                    SELECT id FROM template_lock
                    WHERE template = :filename AND locked_by IS NOT NULL
                    LIMIT 1
                """)
                result = store_db.execute(query, {"filename": request.filename}).first()

                if result:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Template is already locked"
                    )

                # Insert lock record
                insert_query = text("""
                    INSERT INTO template_lock (template, locked_by, locked_on)
                    VALUES (:filename, :user_id, NOW())
                """)
                store_db.execute(insert_query, {
                    "filename": request.filename,
                    "user_id": request.user_id,
                })
            else:
                # Unlock
                delete_query = text("""
                    UPDATE template_lock
                    SET locked_by = NULL, locked_on = NULL
                    WHERE template = :filename
                """)
                store_db.execute(delete_query, {"filename": request.filename})

            store_db.commit()
        except HTTPException:
            raise
        except Exception as e:
            store_db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update lock status: {str(e)}"
            )

        return {
            "success": True,
            "filename": request.filename,
            "locked": request.lock,
            "message": f"Template {'locked' if request.lock else 'unlocked'} successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update lock status: {str(e)}"
        )
    finally:
        if store_db:
            store_db.close()


@router.get("/config", response_model=StoreConfigResponse)
def get_store_config(
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get store configuration from store.conf file.
    """
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        conf_path = os.path.join(STORE_FILES_ROOT, "store.conf")

        if not os.path.exists(conf_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="store.conf file not found"
            )

        config = parse_store_conf(conf_path)

        return StoreConfigResponse(config=config)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get store config: {str(e)}"
        )


@router.put("/config", response_model=dict)
def update_store_config(
    site_id: int = Query(..., description="Store ID"),
    request: StoreConfigUpdateRequest = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update store configuration in store.conf file.
    """
    try:
        if not request:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Request body is required"
            )

        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        conf_path = os.path.join(STORE_FILES_ROOT, "store.conf")

        # Read existing config
        existing_config = {}
        if os.path.exists(conf_path):
            existing_config = parse_store_conf(conf_path)

        # Merge with new values
        existing_config.update(request.config)

        # Write back to file
        write_store_conf(conf_path, existing_config)

        return {
            "success": True,
            "message": "Store config updated successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update store config: {str(e)}"
        )

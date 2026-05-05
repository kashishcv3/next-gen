from fastapi import APIRouter, Depends, Query, HTTPException, status, Path, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.database import get_db, get_store_db_name, get_store_session
from app.models.user import User
from app.dependencies import get_current_admin_user, get_current_user

router = APIRouter(prefix="/marketing", tags=["marketing"])


# Meta Tag Models
class MetaTagBase(BaseModel):
    name: str
    title: Optional[str] = None
    description: Optional[str] = None
    keywords: Optional[str] = None
    classification: Optional[str] = None
    pre_comment: Optional[str] = None
    pre_body: Optional[str] = None
    post_comment: Optional[str] = None
    post_body: Optional[str] = None
    alt_tag1: Optional[str] = None
    alt_tag2: Optional[str] = None
    alt_tag3: Optional[str] = None


class MetaTag(MetaTagBase):
    id: int

    class Config:
        from_attributes = True


class MetaTagList(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[MetaTag]


# Meta Gateway Models
class MetaGatewayBase(BaseModel):
    meta_name: str
    display_name: str
    meta_id: int
    destination: str


class MetaGateway(MetaGatewayBase):
    id: int

    class Config:
        from_attributes = True


class MetaGatewayList(BaseModel):
    total: int
    items: list[MetaGateway]


# Promo Models
class PromoBase(BaseModel):
    promo_name: str
    description: Optional[str] = None
    promo_type: str
    promo_level: str
    trigger: Optional[str] = None
    trigger_type: Optional[str] = None
    event: Optional[str] = None
    event_type: Optional[str] = None
    active: int = 1


class Promo(PromoBase):
    promo_id: int

    class Config:
        from_attributes = True


class PromoList(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[Promo]


# Campaign Models
class CampaignBase(BaseModel):
    name: str
    subject: Optional[str] = None
    description: Optional[str] = None


class Campaign(CampaignBase):
    id: int
    status: str
    recipients: int
    created_date: Optional[str] = None
    sent_date: Optional[str] = None

    class Config:
        from_attributes = True


class CampaignList(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[Campaign]


# Marketing List Models
class MarketingContact(BaseModel):
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    opt_in: int = 1


class MarketingListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[MarketingContact]


# Meta Tags Endpoints
@router.get("/meta-tags", response_model=MetaTagList)
def list_meta_tags(
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        offset = (page - 1) * page_size

        # Get total count
        count_result = store_db.execute(text("SELECT COUNT(*) FROM Meta_data"))
        total = count_result.scalar() or 0

        # Get paginated data
        query = text("""
            SELECT ID, Name, Title, Description,
                   Keywords, Classification,
                   pre_comment, pre_body, post_comment, post_body,
                   alt_tag1, alt_tag2, alt_tag3
            FROM Meta_data
            ORDER BY ID DESC
            LIMIT :limit OFFSET :offset
        """)

        result = store_db.execute(query, {"limit": page_size, "offset": offset})
        items = []
        cols = ['id', 'name', 'title', 'description', 'keywords', 'classification',
                'pre_comment', 'pre_body', 'post_comment', 'post_body',
                'alt_tag1', 'alt_tag2', 'alt_tag3']
        for row in result:
            row_dict = dict(row._mapping) if hasattr(row, '_mapping') else dict(zip(cols, row))
            items.append({c: row_dict.get(c) or row_dict.get(c.upper()) or row_dict.get(c.capitalize()) for c in cols})

        return MetaTagList(total=total, page=page, page_size=page_size, items=items)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching meta tags: {str(e)}")
    finally:
        if store_db:
            store_db.close()


@router.get("/meta-tags/{meta_id}", response_model=MetaTag)
def get_meta_tag(
    meta_id: int,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        query = text("""
            SELECT ID, Name, Title, Description,
                   Keywords, Classification,
                   pre_comment, pre_body, post_comment, post_body,
                   alt_tag1, alt_tag2, alt_tag3
            FROM Meta_data
            WHERE ID = :id
        """)

        result = store_db.execute(query, {"id": meta_id}).first()
        if not result:
            raise HTTPException(status_code=404, detail="Meta tag not found")

        cols = ['id', 'name', 'title', 'description', 'keywords', 'classification',
                'pre_comment', 'pre_body', 'post_comment', 'post_body',
                'alt_tag1', 'alt_tag2', 'alt_tag3']
        row_dict = dict(result._mapping) if hasattr(result, '_mapping') else dict(zip(cols, result))
        return {c: row_dict.get(c) or row_dict.get(c.upper()) or row_dict.get(c.capitalize()) for c in cols}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching meta tag: {str(e)}")
    finally:
        if store_db:
            store_db.close()


@router.post("/meta-tags", status_code=201)
def create_meta_tag(
    meta_tag: MetaTagBase,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        query = text("""
            INSERT INTO Meta_data
            (Name, Title, Description, Keywords, Classification,
             pre_comment, pre_body, post_comment, post_body,
             alt_tag1, alt_tag2, alt_tag3)
            VALUES
            (:name, :title, :description, :keywords, :classification,
             :pre_comment, :pre_body, :post_comment, :post_body,
             :alt_tag1, :alt_tag2, :alt_tag3)
        """)

        store_db.execute(query, {
            "name": meta_tag.name,
            "title": meta_tag.title,
            "description": meta_tag.description,
            "keywords": meta_tag.keywords,
            "classification": meta_tag.classification,
            "pre_comment": meta_tag.pre_comment,
            "pre_body": meta_tag.pre_body,
            "post_comment": meta_tag.post_comment,
            "post_body": meta_tag.post_body,
            "alt_tag1": meta_tag.alt_tag1,
            "alt_tag2": meta_tag.alt_tag2,
            "alt_tag3": meta_tag.alt_tag3,
        })
        store_db.commit()
        return {"status": "success", "message": "Meta tag created"}
    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating meta tag: {str(e)}")
    finally:
        if store_db:
            store_db.close()


@router.put("/meta-tags/{meta_id}")
def update_meta_tag(
    meta_id: int,
    meta_tag: MetaTagBase,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        query = text("""
            UPDATE Meta_data
            SET Name = :name, Title = :title, Description = :description,
                Keywords = :keywords, Classification = :classification,
                pre_comment = :pre_comment, pre_body = :pre_body,
                post_comment = :post_comment, post_body = :post_body,
                alt_tag1 = :alt_tag1, alt_tag2 = :alt_tag2, alt_tag3 = :alt_tag3
            WHERE ID = :id
        """)

        store_db.execute(query, {
            "id": meta_id,
            "name": meta_tag.name,
            "title": meta_tag.title,
            "description": meta_tag.description,
            "keywords": meta_tag.keywords,
            "classification": meta_tag.classification,
            "pre_comment": meta_tag.pre_comment,
            "pre_body": meta_tag.pre_body,
            "post_comment": meta_tag.post_comment,
            "post_body": meta_tag.post_body,
            "alt_tag1": meta_tag.alt_tag1,
            "alt_tag2": meta_tag.alt_tag2,
            "alt_tag3": meta_tag.alt_tag3,
        })
        store_db.commit()
        return {"status": "success", "message": "Meta tag updated"}
    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating meta tag: {str(e)}")
    finally:
        if store_db:
            store_db.close()


@router.delete("/meta-tags/{meta_id}")
def delete_meta_tag(
    meta_id: int,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    store_db = None
    try:
        if meta_id == 1:
            raise HTTPException(status_code=400, detail="Cannot delete default meta tag")

        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        # Check if meta is in use
        check_query = text("SELECT COUNT(*) FROM meta_gateway WHERE meta_id = :id")
        result = store_db.execute(check_query, {"id": meta_id}).scalar()
        if result and result > 0:
            raise HTTPException(status_code=400, detail="Meta tag is in use by gateways")

        query = text("DELETE FROM Meta_data WHERE ID = :id")
        store_db.execute(query, {"id": meta_id})
        store_db.commit()
        return {"status": "success", "message": "Meta tag deleted"}
    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting meta tag: {str(e)}")
    finally:
        if store_db:
            store_db.close()


# Meta Gateway Endpoints
@router.get("/meta-gateways", response_model=MetaGatewayList)
def list_meta_gateways(
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        query = text("""
            SELECT id, meta_name, display_name, meta_id, destination
            FROM meta_gateway
            ORDER BY meta_name
        """)

        result = store_db.execute(query)
        items = []
        cols = ['id', 'meta_name', 'display_name', 'meta_id', 'destination']
        for row in result:
            row_dict = dict(row._mapping) if hasattr(row, '_mapping') else dict(zip(cols, row))
            items.append({c: row_dict.get(c) for c in cols})

        return MetaGatewayList(total=len(items), items=items)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching meta gateways: {str(e)}")
    finally:
        if store_db:
            store_db.close()


@router.get("/meta-gateways/{gateway_id}", response_model=MetaGateway)
def get_meta_gateway(
    gateway_id: int,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        query = text("""
            SELECT id, meta_name, display_name, meta_id, destination
            FROM meta_gateway
            WHERE id = :id
        """)

        result = store_db.execute(query, {"id": gateway_id}).first()
        if not result:
            raise HTTPException(status_code=404, detail="Meta gateway not found")

        cols = ['id', 'meta_name', 'display_name', 'meta_id', 'destination']
        row_dict = dict(result._mapping) if hasattr(result, '_mapping') else dict(zip(cols, result))
        return {c: row_dict.get(c) for c in cols}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching meta gateway: {str(e)}")
    finally:
        if store_db:
            store_db.close()


@router.post("/meta-gateways", status_code=201)
def create_meta_gateway(
    gateway: MetaGatewayBase,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        query = text("""
            INSERT INTO meta_gateway
            (meta_name, display_name, meta_id, destination)
            VALUES (:meta_name, :display_name, :meta_id, :destination)
        """)

        store_db.execute(query, {
            "meta_name": gateway.meta_name,
            "display_name": gateway.display_name,
            "meta_id": gateway.meta_id,
            "destination": gateway.destination,
        })
        store_db.commit()
        return {"status": "success", "message": "Meta gateway created"}
    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating meta gateway: {str(e)}")
    finally:
        if store_db:
            store_db.close()


@router.put("/meta-gateways/{gateway_id}")
def update_meta_gateway(
    gateway_id: int,
    gateway: MetaGatewayBase,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        query = text("""
            UPDATE meta_gateway
            SET meta_name = :meta_name, display_name = :display_name,
                meta_id = :meta_id, destination = :destination
            WHERE id = :id
        """)

        store_db.execute(query, {
            "id": gateway_id,
            "meta_name": gateway.meta_name,
            "display_name": gateway.display_name,
            "meta_id": gateway.meta_id,
            "destination": gateway.destination,
        })
        store_db.commit()
        return {"status": "success", "message": "Meta gateway updated"}
    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating meta gateway: {str(e)}")
    finally:
        if store_db:
            store_db.close()


@router.delete("/meta-gateways/{gateway_id}")
def delete_meta_gateway(
    gateway_id: int,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        query = text("DELETE FROM meta_gateway WHERE id = :id")
        store_db.execute(query, {"id": gateway_id})
        store_db.commit()
        return {"status": "success", "message": "Meta gateway deleted"}
    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting meta gateway: {str(e)}")
    finally:
        if store_db:
            store_db.close()


# Promo Endpoints
@router.get("/promos", response_model=PromoList)
def list_promos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    try:
        offset = (page - 1) * page_size

        count_result = db.execute(text("SELECT COUNT(*) as total FROM promos"))
        total = count_result.scalar() or 0

        query = text("""
            SELECT promo_id, promo_name, description, promo_type,
                   promo_level, trigger, trigger_type, event, event_type, active
            FROM promos
            ORDER BY promo_id DESC
            LIMIT :limit OFFSET :offset
        """)

        result = db.execute(query, {"limit": page_size, "offset": offset})
        items = []
        for row in result:
            items.append({
                "promo_id": row.promo_id,
                "promo_name": row.promo_name,
                "description": row.description,
                "promo_type": row.promo_type,
                "promo_level": row.promo_level,
                "trigger": row.trigger,
                "trigger_type": row.trigger_type,
                "event": row.event,
                "event_type": row.event_type,
                "active": row.active,
            })

        return PromoList(total=total, page=page, page_size=page_size, items=items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching promos: {str(e)}")


@router.get("/promos/{promo_id}")
def get_promo(
    promo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    try:
        query = text("""
            SELECT promo_id, promo_name, description, promo_type,
                   promo_level, trigger, trigger_type, event, event_type, active
            FROM promos
            WHERE promo_id = :id
        """)

        result = db.execute(query, {"id": promo_id}).first()
        if not result:
            raise HTTPException(status_code=404, detail="Promo not found")

        return {
            "promo_id": result.promo_id,
            "promo_name": result.promo_name,
            "description": result.description,
            "promo_type": result.promo_type,
            "promo_level": result.promo_level,
            "trigger": result.trigger,
            "trigger_type": result.trigger_type,
            "event": result.event,
            "event_type": result.event_type,
            "active": result.active,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching promo: {str(e)}")


@router.post("/promos", status_code=201)
def create_promo(
    promo: PromoBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    try:
        query = text("""
            INSERT INTO promos
            (promo_name, description, promo_type, promo_level,
             trigger, trigger_type, event, event_type, active)
            VALUES (:promo_name, :description, :promo_type, :promo_level,
                    :trigger, :trigger_type, :event, :event_type, :active)
        """)

        db.execute(query, {
            "promo_name": promo.promo_name,
            "description": promo.description,
            "promo_type": promo.promo_type,
            "promo_level": promo.promo_level,
            "trigger": promo.trigger,
            "trigger_type": promo.trigger_type,
            "event": promo.event,
            "event_type": promo.event_type,
            "active": promo.active,
        })
        db.commit()
        return {"status": "success", "message": "Promo created"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating promo: {str(e)}")


@router.put("/promos/{promo_id}")
def update_promo(
    promo_id: int,
    promo: PromoBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    try:
        query = text("""
            UPDATE promos
            SET promo_name = :promo_name, description = :description,
                promo_type = :promo_type, promo_level = :promo_level,
                trigger = :trigger, trigger_type = :trigger_type,
                event = :event, event_type = :event_type, active = :active
            WHERE promo_id = :id
        """)

        db.execute(query, {
            "id": promo_id,
            "promo_name": promo.promo_name,
            "description": promo.description,
            "promo_type": promo.promo_type,
            "promo_level": promo.promo_level,
            "trigger": promo.trigger,
            "trigger_type": promo.trigger_type,
            "event": promo.event,
            "event_type": promo.event_type,
            "active": promo.active,
        })
        db.commit()
        return {"status": "success", "message": "Promo updated"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating promo: {str(e)}")


@router.delete("/promos/{promo_id}")
def delete_promo(
    promo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    try:
        query = text("DELETE FROM promos WHERE promo_id = :id")
        db.execute(query, {"id": promo_id})
        db.commit()
        return {"status": "success", "message": "Promo deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting promo: {str(e)}")


@router.put("/promos/{promo_id}/toggle")
def toggle_promo_active(
    promo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    try:
        query = text("""
            UPDATE promos
            SET active = CASE WHEN active = 0 THEN 1 ELSE 0 END
            WHERE promo_id = :id
        """)

        db.execute(query, {"id": promo_id})
        db.commit()
        return {"status": "success", "message": "Promo status toggled"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error toggling promo: {str(e)}")


# Campaign/Lettercast Endpoints
@router.get("/campaigns", response_model=CampaignList)
def list_campaigns(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
):
    try:
        offset = (page - 1) * page_size

        where_clause = "WHERE 1=1"
        params = {}

        if search:
            where_clause += " AND (campaign_name LIKE :search OR subject LIKE :search)"
            params["search"] = f"%{search}%"

        if status:
            where_clause += " AND status = :status"
            params["status"] = status

        count_result = db.execute(text(f"SELECT COUNT(*) as total FROM lc_campaigns {where_clause}"), params)
        total = count_result.scalar() or 0

        query = text(f"""
            SELECT id, campaign_name, subject, status,
                   recipient_count, created_at, sent_at
            FROM lc_campaigns
            {where_clause}
            ORDER BY id DESC
            LIMIT :limit OFFSET :offset
        """)

        params["limit"] = page_size
        params["offset"] = offset

        result = db.execute(query, params)
        items = []
        for row in result:
            items.append({
                "id": row.id,
                "name": row.campaign_name,
                "subject": row.subject,
                "status": row.status,
                "recipients": row.recipient_count,
                "created_date": row.created_at.isoformat() if row.created_at else None,
                "sent_date": row.sent_at.isoformat() if row.sent_at else None,
            })

        return CampaignList(total=total, page=page, page_size=page_size, items=items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching campaigns: {str(e)}")


@router.get("/campaigns/{campaign_id}")
def get_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    try:
        query = text("""
            SELECT id, campaign_name, subject, body, status,
                   recipient_count, created_at, sent_at
            FROM lc_campaigns
            WHERE id = :id
        """)

        result = db.execute(query, {"id": campaign_id}).first()
        if not result:
            raise HTTPException(status_code=404, detail="Campaign not found")

        return {
            "id": result.id,
            "name": result.campaign_name,
            "subject": result.subject,
            "description": result.body,
            "status": result.status,
            "recipients": result.recipient_count,
            "created_date": result.created_at.isoformat() if result.created_at else None,
            "sent_date": result.sent_at.isoformat() if result.sent_at else None,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching campaign: {str(e)}")


@router.post("/campaigns", status_code=201)
def create_campaign(
    campaign: CampaignBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    try:
        query = text("""
            INSERT INTO lc_campaigns
            (campaign_name, subject, body, status, created_at)
            VALUES (:name, :subject, :description, 'draft', NOW())
        """)

        db.execute(query, {
            "name": campaign.name,
            "subject": campaign.subject,
            "description": campaign.description,
        })
        db.commit()
        return {"status": "success", "message": "Campaign created"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating campaign: {str(e)}")


@router.delete("/campaigns/{campaign_id}")
def delete_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    try:
        query = text("DELETE FROM lc_campaigns WHERE id = :id")
        db.execute(query, {"id": campaign_id})
        db.commit()
        return {"status": "success", "message": "Campaign deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting campaign: {str(e)}")


# Marketing List Endpoints
@router.get("/marketing-list", response_model=MarketingListResponse)
def list_marketing_contacts(
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
):
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        offset = (page - 1) * page_size

        where_clause = "WHERE 1=1"
        params = {}

        if search:
            where_clause += " AND email LIKE :search"
            params["search"] = f"%{search}%"

        count_result = store_db.execute(text(f"SELECT COUNT(*) as total FROM `marketing` {where_clause}"), params)
        total = count_result.scalar() or 0

        query = text(f"""
            SELECT email, first_name, last_name, opt_out
            FROM `marketing`
            {where_clause}
            ORDER BY email
            LIMIT :limit OFFSET :offset
        """)

        params["limit"] = page_size
        params["offset"] = offset

        result = store_db.execute(query, params)
        items = []
        for row in result:
            items.append({
                "email": row.email or "",
                "first_name": row.first_name or "",
                "last_name": row.last_name or "",
                "opt_in": 0 if row.opt_out == 'y' else 1,
            })

        return MarketingListResponse(total=total, page=page, page_size=page_size, items=items)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching marketing list: {str(e)}")
    finally:
        if store_db:
            store_db.close()


@router.post("/marketing-list", status_code=201)
def add_marketing_contact(
    contact: MarketingContact,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        opt_out = 'y' if contact.opt_in == 0 else 'n'
        query = text("""
            INSERT INTO `marketing`
            (email, first_name, last_name, opt_out, date, date_created)
            VALUES (:email, :first_name, :last_name, :opt_out, NOW(), NOW())
            ON DUPLICATE KEY UPDATE
            first_name = :first_name, last_name = :last_name, opt_out = :opt_out
        """)

        store_db.execute(query, {
            "email": contact.email,
            "first_name": contact.first_name,
            "last_name": contact.last_name,
            "opt_out": opt_out,
        })
        store_db.commit()
        return {"status": "success", "message": "Contact added"}
    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=f"Error adding contact: {str(e)}")
    finally:
        if store_db:
            store_db.close()


@router.delete("/marketing-list/{email}")
def delete_marketing_contact(
    email: str,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    store_db = None
    try:
        store_db_name = get_store_db_name(site_id, db)
        if not store_db_name:
            raise HTTPException(status_code=404, detail="Store not found")
        store_db = get_store_session(store_db_name)

        query = text("DELETE FROM `marketing` WHERE email = :email")
        store_db.execute(query, {"email": email})
        store_db.commit()
        return {"status": "success", "message": "Contact deleted"}
    except HTTPException:
        raise
    except Exception as e:
        if store_db:
            store_db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting contact: {str(e)}")
    finally:
        if store_db:
            store_db.close()


# Marketing Options Endpoints (HubSpot, Bronto, Klaviyo, etc.)
@router.get("/options/{option_type}")
def get_marketing_options_by_type(
    option_type: str = Path(..., description="Option type: hubspot, bronto, klaviyo, mailchimp, dotmailer, rejoiner, structured-data"),
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get marketing options by type from central DB marketing_options table.
    These fields live in the central colorcommerce database, keyed by site_id."""
    try:
        # Define which fields belong to each marketing option type
        OPTION_FIELDS = {
            "hubspot": ['hubspot_leads', 'hubspot_apikey', 'hubspot_portalid', 'hubspot_createform_guid'],
            "bronto": ['bronto_token', 'bronto_order_message', 'bronto_contacts_eml', 'bronto_contacts_lst',
                       'bronto_contacts_sid', 'bronto_contacts_uid', 'bronto_contacts_key',
                       'bronto_rest_api_id', 'bronto_rest_api_secret'],
            "klaviyo": ['klaviyo_enable', 'klaviyo_api_key', 'klaviyo_list_id'],
            "mailchimp": ['mailchimp_enable', 'mailchimp_api_key', 'mailchimp_list_id', 'mailchimp_use_ecommerce'],
            "dotmailer": ['dotmailer_enable', 'dotmailer_api_user', 'dotmailer_api_password', 'dotmailer_address_book'],
            "rejoiner": ['rejoiner_enable', 'rejoiner_site_id', 'rejoiner_api_key', 'rejoiner_api_secret'],
            "structured-data": ['schema_org_enable', 'schema_org_type', 'schema_org_properties'],
        }

        fields = OPTION_FIELDS.get(option_type, [])
        if not fields:
            raise HTTPException(status_code=400, detail=f"Unknown marketing option type: {option_type}")

        # Query the central database marketing_options table
        try:
            rows = db.execute(text("SELECT * FROM `marketing_options` WHERE site_id = :sid LIMIT 1"),
                              {"sid": site_id}).fetchall()
        except Exception:
            db.rollback()
            return {"data": {}}

        if not rows:
            return {"data": {}}

        # Get column names
        cols = [r[0] for r in db.execute(text("SHOW COLUMNS FROM `marketing_options`")).fetchall()]
        row = rows[0]
        data = {}

        # Extract requested fields
        for i, col in enumerate(cols):
            if col in fields:
                val = row[i] if i < len(row) else None
                data[col] = str(val) if val is not None else ""

        return {"data": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/options/{option_type}")
async def save_marketing_options_by_type(
    option_type: str = Path(..., description="Option type"),
    request: Request = None,
    site_id: int = Query(..., description="Store ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save marketing options by type to central DB (marketing_options table)."""
    try:
        # Get the request body
        body = await request.json()

        # Define which fields belong to each marketing option type
        OPTION_FIELDS = {
            "hubspot": ['hubspot_leads', 'hubspot_apikey', 'hubspot_portalid', 'hubspot_createform_guid'],
            "bronto": ['bronto_token', 'bronto_order_message', 'bronto_contacts_eml', 'bronto_contacts_lst',
                       'bronto_contacts_sid', 'bronto_contacts_uid', 'bronto_contacts_key',
                       'bronto_rest_api_id', 'bronto_rest_api_secret'],
            "klaviyo": ['klaviyo_enable', 'klaviyo_api_key', 'klaviyo_list_id'],
            "mailchimp": ['mailchimp_enable', 'mailchimp_api_key', 'mailchimp_list_id', 'mailchimp_use_ecommerce'],
            "dotmailer": ['dotmailer_enable', 'dotmailer_api_user', 'dotmailer_api_password', 'dotmailer_address_book'],
            "rejoiner": ['rejoiner_enable', 'rejoiner_site_id', 'rejoiner_api_key', 'rejoiner_api_secret'],
            "structured-data": ['schema_org_enable', 'schema_org_type', 'schema_org_properties'],
        }

        fields = OPTION_FIELDS.get(option_type, [])
        if not fields:
            raise HTTPException(status_code=400, detail=f"Unknown marketing option type: {option_type}")

        if not body:
            return {"message": f"Marketing {option_type} options saved successfully (no changes)"}

        # Check if row exists
        try:
            existing = db.execute(text("SELECT * FROM `marketing_options` WHERE site_id = :sid LIMIT 1"),
                                  {"sid": site_id}).fetchall()
        except Exception:
            db.rollback()
            return {"message": f"Marketing {option_type} options saved (table not found)"}

        # Build update/insert query
        set_clauses = []
        params = {"sid": site_id}
        for field in fields:
            if field in body:
                set_clauses.append(f"`{field}` = :{field}")
                params[field] = body[field]

        if not set_clauses:
            return {"message": f"Marketing {option_type} options saved successfully (no changes)"}

        if existing:
            # Update existing row
            update_query = text(f"UPDATE `marketing_options` SET {', '.join(set_clauses)} WHERE site_id = :sid")
            db.execute(update_query, params)
        else:
            # Insert new row
            cols = ['site_id'] + [f for f in fields if f in body]
            vals = ['site_id'] + [f for f in fields if f in body]
            insert_query = text(f"INSERT INTO `marketing_options` ({', '.join([f'`{c}`' for c in cols])}) VALUES ({', '.join([':' + v for v in vals])})")
            db.execute(insert_query, params)

        db.commit()
        return {"message": f"Marketing {option_type} options saved successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

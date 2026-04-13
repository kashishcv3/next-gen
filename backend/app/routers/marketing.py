from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_admin_user

router = APIRouter(prefix="/marketing", tags=["marketing"])


class CampaignItem(BaseModel):
    id: int
    name: str
    status: str
    created_date: Optional[str]

    class Config:
        from_attributes = True


class CampaignDetail(BaseModel):
    id: int
    name: str
    description: Optional[str]
    status: str
    reach: int
    conversions: int
    created_date: Optional[str]

    class Config:
        from_attributes = True


class CampaignList(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[CampaignItem]


@router.get("/campaigns", response_model=CampaignList)
def list_campaigns(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    return CampaignList(
        total=0,
        page=page,
        page_size=page_size,
        items=[],
    )


@router.get("/campaigns/{campaign_id}", response_model=CampaignDetail)
def get_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    return {
        "id": campaign_id,
        "name": "Unknown Campaign",
        "description": None,
        "status": "unknown",
        "reach": 0,
        "conversions": 0,
        "created_date": None,
    }


@router.get("/promotions")
def list_promotions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    return {
        "total": 0,
        "page": page,
        "page_size": page_size,
        "items": [],
    }


@router.get("/email-templates")
def list_email_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    return {
        "items": [],
    }

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.store import Site, UserSite
from app.schemas.master_list import MasterListResponse, DeveloperOut, SubuserOut, StoreOut
from app.dependencies import get_current_admin_user

router = APIRouter(prefix="/master-list", tags=["master-list"])


def get_stores_for_user(db: Session, uid: int):
    """Get all stores associated with a user"""
    stores = db.query(Site).join(
        UserSite, Site.site_id == UserSite.site_id
    ).filter(
        UserSite.uid == uid
    ).all()
    return stores


@router.get("", response_model=MasterListResponse)
def get_master_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    display: str = Query(None),
):
    """
    Get the master list of developers and their stores.

    Args:
        display: Optional - 'all' to expand all developers, or a uid to expand a specific developer
    """

    # Get all developers (excluding bigadmin and bigadmin_limit)
    developers_query = db.query(User).filter(
        User.user_type.notin_(['bigadmin', 'bigadmin_limit']),
        User.parent_id.is_(None)  # Only main developers, not subusers
    ).order_by(User.username)

    developers_data = []

    for developer in developers_query.all():
        # Get stores for this developer
        developer_stores = get_stores_for_user(db, developer.uid)
        total_stores = len(developer_stores)

        # Get subusers for this developer
        subusers_query = db.query(User).filter(
            User.parent_id == developer.uid
        ).all()

        subusers_data = []
        for subuser in subusers_query:
            subuser_stores = get_stores_for_user(db, subuser.uid)
            subuser_out = SubuserOut(
                uid=subuser.uid,
                username=subuser.username,
                user_type=subuser.user_type,
                co_name=subuser.co_name,
                stores=[StoreOut.model_validate(s) for s in subuser_stores]
            )
            subusers_data.append(subuser_out)

        developer_out = DeveloperOut(
            uid=developer.uid,
            username=developer.username,
            user_type=developer.user_type,
            co_name=developer.co_name,
            total_stores=total_stores,
            stores=[StoreOut.model_validate(s) for s in developer_stores],
            subusers=subusers_data
        )
        developers_data.append(developer_out)

    return MasterListResponse(developers=developers_data)


@router.post("")
def update_master_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Update billing information for stores.
    This is a stub endpoint for future implementation.
    """
    return {"status": "success"}

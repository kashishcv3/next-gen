"""CRUD for `users_sites`."""
from app.crud.base import CRUDBase
from app.models.store import UserSite


class CRUDUserSite(CRUDBase[UserSite]):
    pass


crud_users_sites = CRUDUserSite(UserSite)

"""CRUD for `sub_users`."""
from app.crud.base import CRUDBase
from app.models.sub_users import SubUsers


class CRUDSubUsers(CRUDBase[SubUsers]):
    pass


crud_sub_users = CRUDSubUsers(SubUsers)

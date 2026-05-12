"""CRUD for `users_admins`."""
from app.crud.base import CRUDBase
from app.models.store import UserAdmin


class CRUDUserAdmin(CRUDBase[UserAdmin]):
    pass


crud_users_admins = CRUDUserAdmin(UserAdmin)

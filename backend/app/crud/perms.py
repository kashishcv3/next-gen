"""CRUD for `perms`."""
from app.crud.base import CRUDBase
from app.models.permission import Permission


class CRUDPermission(CRUDBase[Permission]):
    pass


crud_perms = CRUDPermission(Permission)

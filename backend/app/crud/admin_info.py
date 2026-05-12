"""CRUD for `admin_info`."""
from app.crud.base import CRUDBase
from app.models.admin_info import AdminInfo


class CRUDAdminInfo(CRUDBase[AdminInfo]):
    pass


crud_admin_info = CRUDAdminInfo(AdminInfo)

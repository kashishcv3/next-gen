"""CRUD for `gpg_key`."""
from app.crud.base import CRUDBase
from app.models.gpg_key import GpgKey


class CRUDGpgKey(CRUDBase[GpgKey]):
    pass


crud_gpg_key = CRUDGpgKey(GpgKey)

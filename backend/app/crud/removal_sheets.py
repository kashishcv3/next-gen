"""CRUD for `removal_sheets`."""
from app.crud.base import CRUDBase
from app.models.removal_sheets import RemovalSheets


class CRUDRemovalSheets(CRUDBase[RemovalSheets]):
    pass


crud_removal_sheets = CRUDRemovalSheets(RemovalSheets)

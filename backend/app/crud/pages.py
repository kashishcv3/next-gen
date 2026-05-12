"""CRUD for `pages`."""
from app.crud.base import CRUDBase
from app.models.page import Page


class CRUDPage(CRUDBase[Page]):
    pass


crud_pages = CRUDPage(Page)

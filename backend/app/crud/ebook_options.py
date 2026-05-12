"""CRUD for `ebook_options`."""
from app.crud.base import CRUDBase
from app.models.ebook_options import EbookOptions


class CRUDEbookOptions(CRUDBase[EbookOptions]):
    pass


crud_ebook_options = CRUDEbookOptions(EbookOptions)

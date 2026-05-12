"""CRUD for `bongo_prod_export`."""
from app.crud.base import CRUDBase
from app.models.bongo_prod_export import BongoProdExport


class CRUDBongoProdExport(CRUDBase[BongoProdExport]):
    pass


crud_bongo_prod_export = CRUDBongoProdExport(BongoProdExport)

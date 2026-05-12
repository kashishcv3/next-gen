"""CRUD for `discount_table_export`."""
from app.crud.base import CRUDBase
from app.models.discount_table_export import DiscountTableExport


class CRUDDiscountTableExport(CRUDBase[DiscountTableExport]):
    pass


crud_discount_table_export = CRUDDiscountTableExport(DiscountTableExport)

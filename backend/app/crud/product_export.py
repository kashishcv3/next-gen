"""CRUD for `product_export`."""
from app.crud.base import CRUDBase
from app.models.product_export import ProductExport


class CRUDProductExport(CRUDBase[ProductExport]):
    pass


crud_product_export = CRUDProductExport(ProductExport)

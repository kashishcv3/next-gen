"""CRUD for `product_group_export`."""
from app.crud.base import CRUDBase
from app.models.product_group_export import ProductGroupExport


class CRUDProductGroupExport(CRUDBase[ProductGroupExport]):
    pass


crud_product_group_export = CRUDProductGroupExport(ProductGroupExport)

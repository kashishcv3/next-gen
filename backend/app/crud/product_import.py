"""CRUD for `product_import`."""
from app.crud.base import CRUDBase
from app.models.product_import import ProductImport


class CRUDProductImport(CRUDBase[ProductImport]):
    pass


crud_product_import = CRUDProductImport(ProductImport)

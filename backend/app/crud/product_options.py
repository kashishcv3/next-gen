"""CRUD for `product_options`."""
from app.crud.base import CRUDBase
from app.models.product_options import ProductOptions


class CRUDProductOptions(CRUDBase[ProductOptions]):
    pass


crud_product_options = CRUDProductOptions(ProductOptions)

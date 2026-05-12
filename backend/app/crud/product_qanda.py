"""CRUD for `product_qanda`."""
from app.crud.base import CRUDBase
from app.models.product_qanda import ProductQanda


class CRUDProductQanda(CRUDBase[ProductQanda]):
    pass


crud_product_qanda = CRUDProductQanda(ProductQanda)

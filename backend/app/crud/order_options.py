"""CRUD for `order_options`."""
from app.crud.base import CRUDBase
from app.models.order_options import OrderOptions


class CRUDOrderOptions(CRUDBase[OrderOptions]):
    pass


crud_order_options = CRUDOrderOptions(OrderOptions)

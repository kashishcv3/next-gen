"""CRUD for `order_export`."""
from app.crud.base import CRUDBase
from app.models.order_export import OrderExport


class CRUDOrderExport(CRUDBase[OrderExport]):
    pass


crud_order_export = CRUDOrderExport(OrderExport)

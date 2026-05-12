"""CRUD for `order_history_import`."""
from app.crud.base import CRUDBase
from app.models.order_history_import import OrderHistoryImport


class CRUDOrderHistoryImport(CRUDBase[OrderHistoryImport]):
    pass


crud_order_history_import = CRUDOrderHistoryImport(OrderHistoryImport)

"""CRUD for `order_management`."""
from app.crud.base import CRUDBase
from app.models.order_management import OrderManagement


class CRUDOrderManagement(CRUDBase[OrderManagement]):
    pass


crud_order_management = CRUDOrderManagement(OrderManagement)

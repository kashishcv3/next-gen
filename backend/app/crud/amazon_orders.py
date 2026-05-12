"""CRUD for `amazon_orders`."""
from app.crud.base import CRUDBase
from app.models.amazon_orders import AmazonOrders


class CRUDAmazonOrders(CRUDBase[AmazonOrders]):
    pass


crud_amazon_orders = CRUDAmazonOrders(AmazonOrders)

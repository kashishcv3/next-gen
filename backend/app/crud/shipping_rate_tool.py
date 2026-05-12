"""CRUD for `shipping_rate_tool`."""
from app.crud.base import CRUDBase
from app.models.shipping_rate_tool import ShippingRateTool


class CRUDShippingRateTool(CRUDBase[ShippingRateTool]):
    pass


crud_shipping_rate_tool = CRUDShippingRateTool(ShippingRateTool)

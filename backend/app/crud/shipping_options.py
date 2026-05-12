"""CRUD for `shipping_options`."""
from app.crud.base import CRUDBase
from app.models.shipping_options import ShippingOptions


class CRUDShippingOptions(CRUDBase[ShippingOptions]):
    pass


crud_shipping_options = CRUDShippingOptions(ShippingOptions)

"""CRUD for `shipping_codes`."""
from app.crud.base import CRUDBase
from app.models.shipping_codes import ShippingCodes


class CRUDShippingCodes(CRUDBase[ShippingCodes]):
    pass


crud_shipping_codes = CRUDShippingCodes(ShippingCodes)

"""CRUD for `cart_abandonment_export_file`."""
from app.crud.base import CRUDBase
from app.models.cart_abandonment_export_file import CartAbandonmentExportFile


class CRUDCartAbandonmentExportFile(CRUDBase[CartAbandonmentExportFile]):
    pass


crud_cart_abandonment_export_file = CRUDCartAbandonmentExportFile(CartAbandonmentExportFile)

"""CRUD for `tax_options`."""
from app.crud.base import CRUDBase
from app.models.tax_options import TaxOptions


class CRUDTaxOptions(CRUDBase[TaxOptions]):
    pass


crud_tax_options = CRUDTaxOptions(TaxOptions)

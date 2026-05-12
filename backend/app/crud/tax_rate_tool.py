"""CRUD for `tax_rate_tool`."""
from app.crud.base import CRUDBase
from app.models.tax_rate_tool import TaxRateTool


class CRUDTaxRateTool(CRUDBase[TaxRateTool]):
    pass


crud_tax_rate_tool = CRUDTaxRateTool(TaxRateTool)

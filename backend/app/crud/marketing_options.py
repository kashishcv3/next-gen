"""CRUD for `marketing_options`."""
from app.crud.base import CRUDBase
from app.models.marketing_options import MarketingOptions


class CRUDMarketingOptions(CRUDBase[MarketingOptions]):
    pass


crud_marketing_options = CRUDMarketingOptions(MarketingOptions)

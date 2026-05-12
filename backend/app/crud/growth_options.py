"""CRUD for `growth_options`."""
from app.crud.base import CRUDBase
from app.models.growth_options import GrowthOptions


class CRUDGrowthOptions(CRUDBase[GrowthOptions]):
    pass


crud_growth_options = CRUDGrowthOptions(GrowthOptions)

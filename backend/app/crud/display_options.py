"""CRUD for `display_options`."""
from app.crud.base import CRUDBase
from app.models.display_options import DisplayOptions


class CRUDDisplayOptions(CRUDBase[DisplayOptions]):
    pass


crud_display_options = CRUDDisplayOptions(DisplayOptions)

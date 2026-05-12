"""CRUD for `general_options`."""
from app.crud.base import CRUDBase
from app.models.general_options import GeneralOptions


class CRUDGeneralOptions(CRUDBase[GeneralOptions]):
    pass


crud_general_options = CRUDGeneralOptions(GeneralOptions)

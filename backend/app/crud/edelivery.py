"""CRUD for `edelivery`."""
from app.crud.base import CRUDBase
from app.models.edelivery import Edelivery


class CRUDEdelivery(CRUDBase[Edelivery]):
    pass


crud_edelivery = CRUDEdelivery(Edelivery)

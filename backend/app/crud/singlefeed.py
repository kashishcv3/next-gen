"""CRUD for `singlefeed`."""
from app.crud.base import CRUDBase
from app.models.singlefeed import Singlefeed


class CRUDSinglefeed(CRUDBase[Singlefeed]):
    pass


crud_singlefeed = CRUDSinglefeed(Singlefeed)

"""CRUD for `pimport_queue`."""
from app.crud.base import CRUDBase
from app.models.pimport_queue import PimportQueue


class CRUDPimportQueue(CRUDBase[PimportQueue]):
    pass


crud_pimport_queue = CRUDPimportQueue(PimportQueue)

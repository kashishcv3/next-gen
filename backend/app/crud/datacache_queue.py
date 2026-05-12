"""CRUD for `datacache_queue`."""
from app.crud.base import CRUDBase
from app.models.datacache_queue import DatacacheQueue


class CRUDDatacacheQueue(CRUDBase[DatacacheQueue]):
    pass


crud_datacache_queue = CRUDDatacacheQueue(DatacacheQueue)

"""CRUD for `garbage_collection_queue`."""
from app.crud.base import CRUDBase
from app.models.garbage_collection_queue import GarbageCollectionQueue


class CRUDGarbageCollectionQueue(CRUDBase[GarbageCollectionQueue]):
    pass


crud_garbage_collection_queue = CRUDGarbageCollectionQueue(GarbageCollectionQueue)

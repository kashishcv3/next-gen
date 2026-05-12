"""CRUD for `serialize_queue`."""
from app.crud.base import CRUDBase
from app.models.serialize_queue import SerializeQueue


class CRUDSerializeQueue(CRUDBase[SerializeQueue]):
    pass


crud_serialize_queue = CRUDSerializeQueue(SerializeQueue)

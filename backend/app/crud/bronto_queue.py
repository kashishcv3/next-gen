"""CRUD for `bronto_queue`."""
from app.crud.base import CRUDBase
from app.models.bronto_queue import BrontoQueue


class CRUDBrontoQueue(CRUDBase[BrontoQueue]):
    pass


crud_bronto_queue = CRUDBrontoQueue(BrontoQueue)

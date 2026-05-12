"""CRUD for `overdrive_queue`."""
from app.crud.base import CRUDBase
from app.models.overdrive_queue import OverdriveQueue


class CRUDOverdriveQueue(CRUDBase[OverdriveQueue]):
    pass


crud_overdrive_queue = CRUDOverdriveQueue(OverdriveQueue)

"""CRUD for `cdn_queue`."""
from app.crud.base import CRUDBase
from app.models.cdn_queue import CdnQueue


class CRUDCdnQueue(CRUDBase[CdnQueue]):
    pass


crud_cdn_queue = CRUDCdnQueue(CdnQueue)

"""CRUD for `websvc_keys_alt`."""
from app.crud.base import CRUDBase
from app.models.websvc_keys_alt import WebsvcKeysAlt


class CRUDWebsvcKeysAlt(CRUDBase[WebsvcKeysAlt]):
    pass


crud_websvc_keys_alt = CRUDWebsvcKeysAlt(WebsvcKeysAlt)

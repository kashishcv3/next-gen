"""CRUD for `webservice_lockout`."""
from app.crud.base import CRUDBase
from app.models.webservice_lockout import WebserviceLockout


class CRUDWebserviceLockout(CRUDBase[WebserviceLockout]):
    pass


crud_webservice_lockout = CRUDWebserviceLockout(WebserviceLockout)

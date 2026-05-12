"""CRUD for `lockout`."""
from app.crud.base import CRUDBase
from app.models.lockout import Lockout


class CRUDLockout(CRUDBase[Lockout]):
    pass


crud_lockout = CRUDLockout(Lockout)

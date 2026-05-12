"""CRUD for `lockout_log`."""
from app.crud.base import CRUDBase
from app.models.lockout_log import LockoutLog


class CRUDLockoutLog(CRUDBase[LockoutLog]):
    pass


crud_lockout_log = CRUDLockoutLog(LockoutLog)

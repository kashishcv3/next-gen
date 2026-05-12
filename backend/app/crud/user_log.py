"""CRUD for `user_log`."""
from app.crud.base import CRUDBase
from app.models.user_log import UserLog


class CRUDUserLog(CRUDBase[UserLog]):
    pass


crud_user_log = CRUDUserLog(UserLog)

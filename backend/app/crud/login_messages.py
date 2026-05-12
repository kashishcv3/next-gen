"""CRUD for `login_messages`."""
from app.crud.base import CRUDBase
from app.models.login_messages import LoginMessages


class CRUDLoginMessages(CRUDBase[LoginMessages]):
    pass


crud_login_messages = CRUDLoginMessages(LoginMessages)

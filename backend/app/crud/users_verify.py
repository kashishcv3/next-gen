"""CRUD for `users_verify`."""
from app.crud.base import CRUDBase
from app.models.users_verify import UsersVerify


class CRUDUsersVerify(CRUDBase[UsersVerify]):
    pass


crud_users_verify = CRUDUsersVerify(UsersVerify)

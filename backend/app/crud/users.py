"""CRUD for `users`."""
from app.crud.base import CRUDBase
from app.models.user import User


class CRUDUser(CRUDBase[User]):
    pass


crud_users = CRUDUser(User)

"""CRUD for `actions`."""
from app.crud.base import CRUDBase
from app.models.action import Action


class CRUDAction(CRUDBase[Action]):
    pass


crud_actions = CRUDAction(Action)

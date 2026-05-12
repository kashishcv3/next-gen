"""CRUD for `action_forwards`."""
from app.crud.base import CRUDBase
from app.models.action import ActionForward


class CRUDActionForward(CRUDBase[ActionForward]):
    pass


crud_action_forwards = CRUDActionForward(ActionForward)

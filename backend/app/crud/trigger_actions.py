"""CRUD for `trigger_actions`."""
from app.crud.base import CRUDBase
from app.models.trigger_actions import TriggerActions


class CRUDTriggerActions(CRUDBase[TriggerActions]):
    pass


crud_trigger_actions = CRUDTriggerActions(TriggerActions)

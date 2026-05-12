"""CRUD for `subscriptions`."""
from app.crud.base import CRUDBase
from app.models.subscriptions import Subscriptions


class CRUDSubscriptions(CRUDBase[Subscriptions]):
    pass


crud_subscriptions = CRUDSubscriptions(Subscriptions)

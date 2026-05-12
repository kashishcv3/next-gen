"""CRUD for `subscription_stores`."""
from app.crud.base import CRUDBase
from app.models.subscription_stores import SubscriptionStores


class CRUDSubscriptionStores(CRUDBase[SubscriptionStores]):
    pass


crud_subscription_stores = CRUDSubscriptionStores(SubscriptionStores)

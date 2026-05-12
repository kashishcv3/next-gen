"""CRUD for `app_store_config`."""
from app.crud.base import CRUDBase
from app.models.app_store_config import AppStoreConfig


class CRUDAppStoreConfig(CRUDBase[AppStoreConfig]):
    pass


crud_app_store_config = CRUDAppStoreConfig(AppStoreConfig)

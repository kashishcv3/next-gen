"""CRUD for `store_contracts`."""
from app.crud.base import CRUDBase
from app.models.store_contracts import StoreContracts


class CRUDStoreContracts(CRUDBase[StoreContracts]):
    pass


crud_store_contracts = CRUDStoreContracts(StoreContracts)

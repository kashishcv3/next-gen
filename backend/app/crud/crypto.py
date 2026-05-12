"""CRUD for `crypto`."""
from app.crud.base import CRUDBase
from app.models.crypto import Crypto


class CRUDCrypto(CRUDBase[Crypto]):
    pass


crud_crypto = CRUDCrypto(Crypto)

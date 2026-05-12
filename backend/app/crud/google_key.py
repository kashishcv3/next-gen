"""CRUD for `google_key`."""
from app.crud.base import CRUDBase
from app.models.google_key import GoogleKey


class CRUDGoogleKey(CRUDBase[GoogleKey]):
    pass


crud_google_key = CRUDGoogleKey(GoogleKey)

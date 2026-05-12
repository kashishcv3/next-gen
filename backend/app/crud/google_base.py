"""CRUD for `google_base`."""
from app.crud.base import CRUDBase
from app.models.google_base import GoogleBase


class CRUDGoogleBase(CRUDBase[GoogleBase]):
    pass


crud_google_base = CRUDGoogleBase(GoogleBase)

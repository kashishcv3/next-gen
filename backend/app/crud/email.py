"""CRUD for `email`."""
from app.crud.base import CRUDBase
from app.models.email import Email


class CRUDEmail(CRUDBase[Email]):
    pass


crud_email = CRUDEmail(Email)

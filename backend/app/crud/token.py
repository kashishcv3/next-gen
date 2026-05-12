"""CRUD for `token`."""
from app.crud.base import CRUDBase
from app.models.token import Token


class CRUDToken(CRUDBase[Token]):
    pass


crud_token = CRUDToken(Token)

"""CRUD for `tokenize_auth_stragglers`."""
from app.crud.base import CRUDBase
from app.models.tokenize_auth_stragglers import TokenizeAuthStragglers


class CRUDTokenizeAuthStragglers(CRUDBase[TokenizeAuthStragglers]):
    pass


crud_tokenize_auth_stragglers = CRUDTokenizeAuthStragglers(TokenizeAuthStragglers)

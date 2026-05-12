"""CRUD for `oauth_scopes`."""
from app.crud.base import CRUDBase
from app.models.oauth_scopes import OauthScopes


class CRUDOauthScopes(CRUDBase[OauthScopes]):
    pass


crud_oauth_scopes = CRUDOauthScopes(OauthScopes)

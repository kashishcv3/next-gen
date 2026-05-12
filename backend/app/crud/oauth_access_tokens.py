"""CRUD for `oauth_access_tokens`."""
from app.crud.base import CRUDBase
from app.models.oauth_access_tokens import OauthAccessTokens


class CRUDOauthAccessTokens(CRUDBase[OauthAccessTokens]):
    pass


crud_oauth_access_tokens = CRUDOauthAccessTokens(OauthAccessTokens)

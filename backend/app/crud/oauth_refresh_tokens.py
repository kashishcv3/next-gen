"""CRUD for `oauth_refresh_tokens`."""
from app.crud.base import CRUDBase
from app.models.oauth_refresh_tokens import OauthRefreshTokens


class CRUDOauthRefreshTokens(CRUDBase[OauthRefreshTokens]):
    pass


crud_oauth_refresh_tokens = CRUDOauthRefreshTokens(OauthRefreshTokens)

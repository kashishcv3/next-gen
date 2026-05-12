"""CRUD for `oauth_clients`."""
from app.crud.base import CRUDBase
from app.models.oauth_clients import OauthClients


class CRUDOauthClients(CRUDBase[OauthClients]):
    pass


crud_oauth_clients = CRUDOauthClients(OauthClients)

"""CRUD for `social_media_connections`."""
from app.crud.base import CRUDBase
from app.models.social_media_connections import SocialMediaConnections


class CRUDSocialMediaConnections(CRUDBase[SocialMediaConnections]):
    pass


crud_social_media_connections = CRUDSocialMediaConnections(SocialMediaConnections)

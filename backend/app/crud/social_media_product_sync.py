"""CRUD for `social_media_product_sync`."""
from app.crud.base import CRUDBase
from app.models.social_media_product_sync import SocialMediaProductSync


class CRUDSocialMediaProductSync(CRUDBase[SocialMediaProductSync]):
    pass


crud_social_media_product_sync = CRUDSocialMediaProductSync(SocialMediaProductSync)

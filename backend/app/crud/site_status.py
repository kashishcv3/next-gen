"""CRUD for `site_status`."""
from app.crud.base import CRUDBase
from app.models.site_status import SiteStatus


class CRUDSiteStatus(CRUDBase[SiteStatus]):
    pass


crud_site_status = CRUDSiteStatus(SiteStatus)

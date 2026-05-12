"""CRUD for `sites_ext`."""
from app.crud.base import CRUDBase
from app.models.sites_ext import SitesExt


class CRUDSitesExt(CRUDBase[SitesExt]):
    pass


crud_sites_ext = CRUDSitesExt(SitesExt)

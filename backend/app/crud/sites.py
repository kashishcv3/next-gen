"""CRUD for `sites`."""
from app.crud.base import CRUDBase
from app.models.store import Site


class CRUDSite(CRUDBase[Site]):
    pass


crud_sites = CRUDSite(Site)

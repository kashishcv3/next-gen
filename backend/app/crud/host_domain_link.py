"""CRUD for `host_domain_link`."""
from app.crud.base import CRUDBase
from app.models.host_domain_link import HostDomainLink


class CRUDHostDomainLink(CRUDBase[HostDomainLink]):
    pass


crud_host_domain_link = CRUDHostDomainLink(HostDomainLink)

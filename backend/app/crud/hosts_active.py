"""CRUD for `hosts_active`."""
from app.crud.base import CRUDBase
from app.models.hosts_active import HostsActive


class CRUDHostsActive(CRUDBase[HostsActive]):
    pass


crud_hosts_active = CRUDHostsActive(HostsActive)

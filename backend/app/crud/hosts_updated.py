"""CRUD for `hosts_updated`."""
from app.crud.base import CRUDBase
from app.models.hosts_updated import HostsUpdated


class CRUDHostsUpdated(CRUDBase[HostsUpdated]):
    pass


crud_hosts_updated = CRUDHostsUpdated(HostsUpdated)

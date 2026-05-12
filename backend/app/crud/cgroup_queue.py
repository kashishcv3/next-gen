"""CRUD for `cgroup_queue`."""
from app.crud.base import CRUDBase
from app.models.cgroup_queue import CgroupQueue


class CRUDCgroupQueue(CRUDBase[CgroupQueue]):
    pass


crud_cgroup_queue = CRUDCgroupQueue(CgroupQueue)

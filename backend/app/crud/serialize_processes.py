"""CRUD for `serialize_processes`."""
from app.crud.base import CRUDBase
from app.models.serialize_processes import SerializeProcesses


class CRUDSerializeProcesses(CRUDBase[SerializeProcesses]):
    pass


crud_serialize_processes = CRUDSerializeProcesses(SerializeProcesses)

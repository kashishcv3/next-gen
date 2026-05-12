"""CRUD for `serialize_log`."""
from app.crud.base import CRUDBase
from app.models.serialize_log import SerializeLog


class CRUDSerializeLog(CRUDBase[SerializeLog]):
    pass


crud_serialize_log = CRUDSerializeLog(SerializeLog)

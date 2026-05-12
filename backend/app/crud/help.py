"""CRUD for `help`."""
from app.crud.base import CRUDBase
from app.models.help import Help


class CRUDHelp(CRUDBase[Help]):
    pass


crud_help = CRUDHelp(Help)

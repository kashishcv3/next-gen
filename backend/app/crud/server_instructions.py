"""CRUD for `server_instructions`."""
from app.crud.base import CRUDBase
from app.models.server_instructions import ServerInstructions


class CRUDServerInstructions(CRUDBase[ServerInstructions]):
    pass


crud_server_instructions = CRUDServerInstructions(ServerInstructions)

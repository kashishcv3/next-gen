"""CRUD for `server_instructions_hosts`."""
from app.crud.base import CRUDBase
from app.models.server_instructions_hosts import ServerInstructionsHosts


class CRUDServerInstructionsHosts(CRUDBase[ServerInstructionsHosts]):
    pass


crud_server_instructions_hosts = CRUDServerInstructionsHosts(ServerInstructionsHosts)

"""CRUD for `sendgrid_accts`."""
from app.crud.base import CRUDBase
from app.models.sendgrid_accts import SendgridAccts


class CRUDSendgridAccts(CRUDBase[SendgridAccts]):
    pass


crud_sendgrid_accts = CRUDSendgridAccts(SendgridAccts)

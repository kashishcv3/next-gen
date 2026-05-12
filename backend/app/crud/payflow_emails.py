"""CRUD for `payflow_emails`."""
from app.crud.base import CRUDBase
from app.models.payflow_emails import PayflowEmails


class CRUDPayflowEmails(CRUDBase[PayflowEmails]):
    pass


crud_payflow_emails = CRUDPayflowEmails(PayflowEmails)

"""CRUD for `paypal_emails`."""
from app.crud.base import CRUDBase
from app.models.paypal_emails import PaypalEmails


class CRUDPaypalEmails(CRUDBase[PaypalEmails]):
    pass


crud_paypal_emails = CRUDPaypalEmails(PaypalEmails)

"""CRUD for `payment_options`."""
from app.crud.base import CRUDBase
from app.models.payment_options import PaymentOptions


class CRUDPaymentOptions(CRUDBase[PaymentOptions]):
    pass


crud_payment_options = CRUDPaymentOptions(PaymentOptions)

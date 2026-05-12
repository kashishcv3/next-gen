"""CRUD for `checkout_alternative`."""
from app.crud.base import CRUDBase
from app.models.checkout_alternative import CheckoutAlternative


class CRUDCheckoutAlternative(CRUDBase[CheckoutAlternative]):
    pass


crud_checkout_alternative = CRUDCheckoutAlternative(CheckoutAlternative)

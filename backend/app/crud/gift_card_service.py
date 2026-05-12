"""CRUD for `gift_card_service`."""
from app.crud.base import CRUDBase
from app.models.gift_card_service import GiftCardService


class CRUDGiftCardService(CRUDBase[GiftCardService]):
    pass


crud_gift_card_service = CRUDGiftCardService(GiftCardService)

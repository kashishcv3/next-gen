"""CRUD for `bigadmin_merchant_link`."""
from app.crud.base import CRUDBase
from app.models.bigadmin_merchant_link import BigadminMerchantLink


class CRUDBigadminMerchantLink(CRUDBase[BigadminMerchantLink]):
    pass


crud_bigadmin_merchant_link = CRUDBigadminMerchantLink(BigadminMerchantLink)

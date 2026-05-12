"""CRUD for `mfa_feature`."""
from app.crud.base import CRUDBase
from app.models.user import MFAFeature


class CRUDMFAFeature(CRUDBase[MFAFeature]):
    pass


crud_mfa_feature = CRUDMFAFeature(MFAFeature)

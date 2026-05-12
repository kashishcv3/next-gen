"""CRUD for `feature_access`."""
from app.crud.base import CRUDBase
from app.models.feature_access import FeatureAccess


class CRUDFeatureAccess(CRUDBase[FeatureAccess]):
    pass


crud_feature_access = CRUDFeatureAccess(FeatureAccess)

"""CRUD for `feature_descriptions`."""
from app.crud.base import CRUDBase
from app.models.feature_descriptions import FeatureDescriptions


class CRUDFeatureDescriptions(CRUDBase[FeatureDescriptions]):
    pass


crud_feature_descriptions = CRUDFeatureDescriptions(FeatureDescriptions)

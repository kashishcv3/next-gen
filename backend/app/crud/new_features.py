"""CRUD for `new_features`."""
from app.crud.base import CRUDBase
from app.models.new_features import NewFeatures


class CRUDNewFeatures(CRUDBase[NewFeatures]):
    pass


crud_new_features = CRUDNewFeatures(NewFeatures)

"""CRUD for `google_base_review`."""
from app.crud.base import CRUDBase
from app.models.google_base_review import GoogleBaseReview


class CRUDGoogleBaseReview(CRUDBase[GoogleBaseReview]):
    pass


crud_google_base_review = CRUDGoogleBaseReview(GoogleBaseReview)

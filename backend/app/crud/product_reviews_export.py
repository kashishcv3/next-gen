"""CRUD for `product_reviews_export`."""
from app.crud.base import CRUDBase
from app.models.product_reviews_export import ProductReviewsExport


class CRUDProductReviewsExport(CRUDBase[ProductReviewsExport]):
    pass


crud_product_reviews_export = CRUDProductReviewsExport(ProductReviewsExport)

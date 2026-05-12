"""CRUD for `category_export`."""
from app.crud.base import CRUDBase
from app.models.category_export import CategoryExport


class CRUDCategoryExport(CRUDBase[CategoryExport]):
    pass


crud_category_export = CRUDCategoryExport(CategoryExport)

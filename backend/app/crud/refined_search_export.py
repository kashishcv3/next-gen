"""CRUD for `refined_search_export`."""
from app.crud.base import CRUDBase
from app.models.refined_search_export import RefinedSearchExport


class CRUDRefinedSearchExport(CRUDBase[RefinedSearchExport]):
    pass


crud_refined_search_export = CRUDRefinedSearchExport(RefinedSearchExport)

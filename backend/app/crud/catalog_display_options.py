"""CRUD for `catalog_display_options`."""
from app.crud.base import CRUDBase
from app.models.catalog_display_options import CatalogDisplayOptions


class CRUDCatalogDisplayOptions(CRUDBase[CatalogDisplayOptions]):
    pass


crud_catalog_display_options = CRUDCatalogDisplayOptions(CatalogDisplayOptions)

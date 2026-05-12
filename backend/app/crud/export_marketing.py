"""CRUD for `export_marketing`."""
from app.crud.base import CRUDBase
from app.models.export_marketing import ExportMarketing


class CRUDExportMarketing(CRUDBase[ExportMarketing]):
    pass


crud_export_marketing = CRUDExportMarketing(ExportMarketing)

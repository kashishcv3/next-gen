"""CRUD for `sli_export`."""
from app.crud.base import CRUDBase
from app.models.sli_export import SliExport


class CRUDSliExport(CRUDBase[SliExport]):
    pass


crud_sli_export = CRUDSliExport(SliExport)

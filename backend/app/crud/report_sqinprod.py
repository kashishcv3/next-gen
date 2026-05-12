"""CRUD for `report_sqinprod`."""
from app.crud.base import CRUDBase
from app.models.report_sqinprod import ReportSqinprod


class CRUDReportSqinprod(CRUDBase[ReportSqinprod]):
    pass


crud_report_sqinprod = CRUDReportSqinprod(ReportSqinprod)

"""CRUD for `reporting_options`."""
from app.crud.base import CRUDBase
from app.models.reporting_options import ReportingOptions


class CRUDReportingOptions(CRUDBase[ReportingOptions]):
    pass


crud_reporting_options = CRUDReportingOptions(ReportingOptions)

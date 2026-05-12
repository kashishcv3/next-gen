"""CRUD for `report_salesrank`."""
from app.crud.base import CRUDBase
from app.models.report_salesrank import ReportSalesrank


class CRUDReportSalesrank(CRUDBase[ReportSalesrank]):
    pass


crud_report_salesrank = CRUDReportSalesrank(ReportSalesrank)

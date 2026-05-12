"""CRUD for `report_referrer`."""
from app.crud.base import CRUDBase
from app.models.report_referrer import ReportReferrer


class CRUDReportReferrer(CRUDBase[ReportReferrer]):
    pass


crud_report_referrer = CRUDReportReferrer(ReportReferrer)

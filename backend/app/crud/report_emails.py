"""CRUD for `report_emails`."""
from app.crud.base import CRUDBase
from app.models.report_emails import ReportEmails


class CRUDReportEmails(CRUDBase[ReportEmails]):
    pass


crud_report_emails = CRUDReportEmails(ReportEmails)

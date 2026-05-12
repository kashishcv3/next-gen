"""CRUD for `scrub_log`."""
from app.crud.base import CRUDBase
from app.models.scrub_log import ScrubLog


class CRUDScrubLog(CRUDBase[ScrubLog]):
    pass


crud_scrub_log = CRUDScrubLog(ScrubLog)

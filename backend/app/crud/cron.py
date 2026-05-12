"""CRUD for `cron`."""
from app.crud.base import CRUDBase
from app.models.cron import Cron


class CRUDCron(CRUDBase[Cron]):
    pass


crud_cron = CRUDCron(Cron)

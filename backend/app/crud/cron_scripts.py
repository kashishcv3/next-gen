"""CRUD for `cron_scripts`."""
from app.crud.base import CRUDBase
from app.models.cron_scripts import CronScripts


class CRUDCronScripts(CRUDBase[CronScripts]):
    pass


crud_cron_scripts = CRUDCronScripts(CronScripts)

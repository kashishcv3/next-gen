"""CRUD for `launch_sheets`."""
from app.crud.base import CRUDBase
from app.models.launch_sheets import LaunchSheets


class CRUDLaunchSheets(CRUDBase[LaunchSheets]):
    pass


crud_launch_sheets = CRUDLaunchSheets(LaunchSheets)

"""CRUD for `launch_checklist`."""
from app.crud.base import CRUDBase
from app.models.launch_checklist import LaunchChecklist


class CRUDLaunchChecklist(CRUDBase[LaunchChecklist]):
    pass


crud_launch_checklist = CRUDLaunchChecklist(LaunchChecklist)

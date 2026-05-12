"""CRUD for `file_backup`."""
from app.crud.base import CRUDBase
from app.models.file_backup import FileBackup


class CRUDFileBackup(CRUDBase[FileBackup]):
    pass


crud_file_backup = CRUDFileBackup(FileBackup)

"""CRUD for `git_queue`."""
from app.crud.base import CRUDBase
from app.models.git_queue import GitQueue


class CRUDGitQueue(CRUDBase[GitQueue]):
    pass


crud_git_queue = CRUDGitQueue(GitQueue)

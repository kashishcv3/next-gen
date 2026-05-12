"""CRUD for `blast_stats`."""
from app.crud.base import CRUDBase
from app.models.blast_stats import BlastStats


class CRUDBlastStats(CRUDBase[BlastStats]):
    pass


crud_blast_stats = CRUDBlastStats(BlastStats)

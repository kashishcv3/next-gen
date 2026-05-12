"""CRUD for `staging_hits`."""
from app.crud.base import CRUDBase
from app.models.staging_hits import StagingHits


class CRUDStagingHits(CRUDBase[StagingHits]):
    pass


crud_staging_hits = CRUDStagingHits(StagingHits)

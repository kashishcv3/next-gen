"""CRUD for `training_videos`."""
from app.crud.base import CRUDBase
from app.models.training_videos import TrainingVideos


class CRUDTrainingVideos(CRUDBase[TrainingVideos]):
    pass


crud_training_videos = CRUDTrainingVideos(TrainingVideos)

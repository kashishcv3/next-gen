"""Auto-generated SQLAlchemy model for `training_videos`.

Mirrors the colorcommerce.training_videos table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class TrainingVideos(Base):
    __tablename__ = "training_videos"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    class_title = Column("class_title", String(255), nullable=True)
    class_description = Column("class_description", Text, nullable=True)
    video_url = Column("video_url", String(50), nullable=True)
    date_added = Column("date_added", DateTime, nullable=True)
    last_modified = Column("last_modified", DateTime, nullable=True)

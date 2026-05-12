"""Auto-generated SQLAlchemy model for `cdn_queue`.

Mirrors the colorcommerce.cdn_queue table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class CdnQueue(Base):
    __tablename__ = "cdn_queue"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    date = Column("date", DateTime, nullable=True)
    cmd = Column("cmd", Text, nullable=True)
    sync_files = Column("sync_files", Text, nullable=True)
    sync_to = Column("sync_to", String(255), nullable=True)
    try_ = Column("try", Integer, nullable=True)
    remove_folder = Column("remove_folder", String(255), nullable=True)
    queue_num = Column("queue_num", Integer, nullable=True)

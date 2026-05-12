"""Auto-generated SQLAlchemy model for `garbage_collection_queue`.

Mirrors the colorcommerce.garbage_collection_queue table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class GarbageCollectionQueue(Base):
    __tablename__ = "garbage_collection_queue"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    store = Column("store", String(20), nullable=True)
    expires = Column("expires", String(11), nullable=True)
    date = Column("date", DateTime, nullable=True)
    server_config = Column("server_config", String(20), nullable=False)

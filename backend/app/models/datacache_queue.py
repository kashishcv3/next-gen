"""Auto-generated SQLAlchemy model for `datacache_queue`.

Mirrors the colorcommerce.datacache_queue table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, LargeBinary, String, Text
from app.database import Base


class DatacacheQueue(Base):
    __tablename__ = "datacache_queue"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    date = Column("date", DateTime, nullable=True)
    store = Column("store", String(50), nullable=True)
    type_ = Column("type", String(10), nullable=False)
    cachekey = Column("cachekey", String(255), nullable=False)
    data = Column("data", Text, nullable=True)
    serialized_data = Column("serialized_data", LargeBinary, nullable=True)
    queue_num = Column("queue_num", Integer, nullable=False)

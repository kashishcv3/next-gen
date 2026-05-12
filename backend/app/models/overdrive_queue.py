"""Auto-generated SQLAlchemy model for `overdrive_queue`.

Mirrors the colorcommerce.overdrive_queue table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class OverdriveQueue(Base):
    __tablename__ = "overdrive_queue"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    conf = Column("conf", String(50), nullable=True)
    date = Column("date", DateTime, nullable=True)
    folder = Column("folder", String(50), nullable=True)
    data = Column("data", Text, nullable=True)

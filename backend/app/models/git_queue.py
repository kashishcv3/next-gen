"""Auto-generated SQLAlchemy model for `git_queue`.

Mirrors the colorcommerce.git_queue table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class GitQueue(Base):
    __tablename__ = "git_queue"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    date = Column("date", DateTime, nullable=True)
    conf = Column("conf", String(50), nullable=True)
    type_ = Column("type", String(50), nullable=True)
    folder = Column("folder", String(50), nullable=True)
    alt = Column("alt", String(50), nullable=True)
    data = Column("data", Text, nullable=True)
    message = Column("message", String(255), nullable=True)
    try_ = Column("try", Integer, nullable=True)

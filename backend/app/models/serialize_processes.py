"""Auto-generated SQLAlchemy model for `serialize_processes`.

Mirrors the colorcommerce.serialize_processes table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class SerializeProcesses(Base):
    __tablename__ = "serialize_processes"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    config_file = Column("config_file", String(100), nullable=True)
    start_date = Column("start_date", DateTime, nullable=True)

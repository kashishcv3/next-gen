"""Auto-generated SQLAlchemy model for `serialize_log`.

Mirrors the colorcommerce.serialize_log table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class SerializeLog(Base):
    __tablename__ = "serialize_log"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    timestamp = Column("timestamp", DateTime, nullable=True)
    config_file = Column("config_file", String(50), nullable=True)
    server = Column("server", String(50), nullable=True)

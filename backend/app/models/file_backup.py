"""Auto-generated SQLAlchemy model for `file_backup`.

Mirrors the colorcommerce.file_backup table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class FileBackup(Base):
    __tablename__ = "file_backup"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    site_id = Column("site_id", Integer, nullable=True)
    date_created = Column("date_created", DateTime, nullable=True)
    file = Column("file", String(50), nullable=True)
    type_ = Column("type", String(255), nullable=True)

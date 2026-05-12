"""Auto-generated SQLAlchemy model for `pimport_queue`.

Mirrors the colorcommerce.pimport_queue table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class PimportQueue(Base):
    __tablename__ = "pimport_queue"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    store = Column("store", String(100), nullable=True)
    filename = Column("filename", String(100), nullable=True)
    inprogress = Column("inprogress", String(1), nullable=True)
    delim = Column("delim", String(1), nullable=True)
    email = Column("email", String(100), nullable=True)
    update_name = Column("update_name", String(1), nullable=True)
    regex = Column("regex", String(100), nullable=True)
    regex_type = Column("regex_type", String(100), nullable=True)

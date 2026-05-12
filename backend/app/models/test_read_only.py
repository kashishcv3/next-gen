"""Auto-generated SQLAlchemy model for `test_read_only`.

Mirrors the colorcommerce.test_read_only table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer
from app.database import Base


class TestReadOnly(Base):
    __tablename__ = "test_read_only"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    date = Column("date", DateTime, nullable=True)

"""Auto-generated SQLAlchemy model for `admin_info`.

Mirrors the colorcommerce.admin_info table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class AdminInfo(Base):
    __tablename__ = "admin_info"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    field = Column("field", String(255), nullable=True)
    value = Column("value", Text, nullable=True)

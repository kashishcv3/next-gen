"""Auto-generated SQLAlchemy model for `order_export`.

Mirrors the colorcommerce.order_export table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class OrderExport(Base):
    __tablename__ = "order_export"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    name = Column("name", String(255), nullable=True)
    description = Column("description", Text, nullable=True)
    list = Column("list", Text, nullable=True)
    type_ = Column("type", Integer, nullable=True)

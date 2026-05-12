"""Auto-generated SQLAlchemy model for `product_group_export`.

Mirrors the colorcommerce.product_group_export table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class ProductGroupExport(Base):
    __tablename__ = "product_group_export"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    site_id = Column("site_id", Integer, nullable=True)
    delimiter = Column("delimiter", String(1), nullable=True)
    email = Column("email", String(50), nullable=True)
    current_files = Column("current_files", Text, nullable=True)
    last_export = Column("last_export", DateTime, nullable=True)

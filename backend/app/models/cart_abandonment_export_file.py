"""Auto-generated SQLAlchemy model for `cart_abandonment_export_file`.

Mirrors the colorcommerce.cart_abandonment_export_file table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class CartAbandonmentExportFile(Base):
    __tablename__ = "cart_abandonment_export_file"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    site_id = Column("site_id", Integer, nullable=True)
    email = Column("email", String(50), nullable=True)
    current_files = Column("current_files", Text, nullable=True)
    last_export = Column("last_export", DateTime, nullable=True)

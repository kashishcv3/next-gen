"""Auto-generated SQLAlchemy model for `order_history_import`.

Mirrors the colorcommerce.order_history_import table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class OrderHistoryImport(Base):
    __tablename__ = "order_history_import"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    site_id = Column("site_id", Integer, nullable=True)
    email = Column("email", String(50), nullable=True)
    delimiter = Column("delimiter", String(5), nullable=True)
    char_set = Column("char_set", String(10), nullable=True)
    on_duplicate = Column("on_duplicate", String(22), nullable=True)

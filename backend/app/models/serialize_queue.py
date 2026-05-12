"""Auto-generated SQLAlchemy model for `serialize_queue`.

Mirrors the colorcommerce.serialize_queue table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class SerializeQueue(Base):
    __tablename__ = "serialize_queue"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    config_file = Column("config_file", String(50), nullable=True)
    date_created = Column("date_created", DateTime, nullable=True)
    last_modified = Column("last_modified", DateTime, nullable=True)
    prod_list = Column("prod_list", Text, nullable=True)
    upd_cats = Column("upd_cats", String(1), nullable=True)
    upd_wholesale = Column("upd_wholesale", String(1), nullable=True)
    upd_freeprods = Column("upd_freeprods", String(1), nullable=True)
    upd_giftsets = Column("upd_giftsets", String(1), nullable=True)

"""Auto-generated SQLAlchemy model for `trigger_actions`.

Mirrors the colorcommerce.trigger_actions table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class TriggerActions(Base):
    __tablename__ = "trigger_actions"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    site_id = Column("site_id", Integer, nullable=False)
    rank = Column("rank", Integer, nullable=False)
    action = Column("action", String(8), nullable=False)
    info = Column("info", Text, nullable=True)
    type_ = Column("type", String(8), nullable=False)
    source = Column("source", String(4), nullable=False)

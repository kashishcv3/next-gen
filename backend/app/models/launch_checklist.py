"""Auto-generated SQLAlchemy model for `launch_checklist`.

Mirrors the colorcommerce.launch_checklist table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class LaunchChecklist(Base):
    __tablename__ = "launch_checklist"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    cat_id = Column("cat_id", Integer, nullable=True)
    name = Column("name", String(255), nullable=True)
    parent = Column("parent", Integer, nullable=True)
    rank = Column("rank", Integer, nullable=True)
    type_ = Column("type", String(8), nullable=True)
    preferences = Column("preferences", String(20), nullable=True)
    week = Column("week", String(10), nullable=True)
    date_added = Column("date_added", DateTime, nullable=True)

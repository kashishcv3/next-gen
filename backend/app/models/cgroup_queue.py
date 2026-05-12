"""Auto-generated SQLAlchemy model for `cgroup_queue`.

Mirrors the colorcommerce.cgroup_queue table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class CgroupQueue(Base):
    __tablename__ = "cgroup_queue"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    store = Column("store", String(100), nullable=True)
    cgroup_id = Column("cgroup_id", Integer, nullable=True)
    inprogress = Column("inprogress", String(1), nullable=True)

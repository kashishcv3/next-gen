"""Auto-generated SQLAlchemy model for `block_list`.

Mirrors the colorcommerce.block_list table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class BlockList(Base):
    __tablename__ = "block_list"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    block = Column("block", String(255), nullable=True)
    block_type = Column("block_type", String(5), nullable=True)
    active = Column("active", String(1), nullable=True)
    date_blocked = Column("date_blocked", DateTime, nullable=True)
    date_unblocked = Column("date_unblocked", DateTime, nullable=True)
    block_user = Column("block_user", String(25), nullable=True)
    unblock_user = Column("unblock_user", String(25), nullable=True)
    case_num = Column("case_num", Integer, nullable=True)
    comments = Column("comments", Text, nullable=True)

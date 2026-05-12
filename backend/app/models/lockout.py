"""Auto-generated SQLAlchemy model for `lockout`.

Mirrors the colorcommerce.lockout table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class Lockout(Base):
    __tablename__ = "lockout"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    ip = Column("ip", String(15), nullable=True)
    fail_count = Column("fail_count", Integer, nullable=True)
    failed_date = Column("failed_date", DateTime, nullable=True)

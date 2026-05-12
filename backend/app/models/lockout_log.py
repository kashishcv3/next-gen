"""Auto-generated SQLAlchemy model for `lockout_log`.

Mirrors the colorcommerce.lockout_log table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class LockoutLog(Base):
    __tablename__ = "lockout_log"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    uid = Column("uid", Integer, nullable=True)
    username = Column("username", String(50), nullable=True)
    ip = Column("ip", String(50), nullable=True)
    referrer = Column("referrer", String(255), nullable=True)
    passwords_used = Column("passwords_used", String(255), nullable=True)
    lockout_date = Column("lockout_date", DateTime, nullable=True)

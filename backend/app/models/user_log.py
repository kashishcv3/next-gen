"""Auto-generated SQLAlchemy model for `user_log`.

Mirrors the colorcommerce.user_log table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class UserLog(Base):
    __tablename__ = "user_log"

    uid = Column("uid", Integer, primary_key=True)
    site_id = Column("site_id", Integer, nullable=True)
    action = Column("action", String(40), nullable=True)
    date = Column("date", DateTime, nullable=True)

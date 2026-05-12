"""Auto-generated SQLAlchemy model for `sub_users`.

Mirrors the colorcommerce.sub_users table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class SubUsers(Base):
    __tablename__ = "sub_users"

    uid = Column("uid", Integer, primary_key=True, autoincrement=True)
    username = Column("username", String(50), nullable=True)
    password = Column("password", String(50), nullable=True)
    creator_id = Column("creator_id", Integer, nullable=True)
    store_id = Column("store_id", Integer, nullable=True)
    date_created = Column("date_created", DateTime, nullable=True)
    remote_ip = Column("remote_ip", String(50), nullable=True)

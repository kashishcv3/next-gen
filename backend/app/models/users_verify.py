"""Auto-generated SQLAlchemy model for `users_verify`.

Mirrors the colorcommerce.users_verify table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class UsersVerify(Base):
    __tablename__ = "users_verify"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    uid = Column("uid", Integer, nullable=True)
    mac_address = Column("mac_address", String(100), nullable=True)
    unique_key = Column("unique_key", String(255), nullable=True)
    data1 = Column("data1", String(255), nullable=True)
    data2 = Column("data2", String(255), nullable=True)

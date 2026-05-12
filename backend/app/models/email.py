"""Auto-generated SQLAlchemy model for `email`.

Mirrors the colorcommerce.email table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class Email(Base):
    __tablename__ = "email"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    email = Column("email", String(255), nullable=True)
    password = Column("password", String(255), nullable=True)
    forward = Column("forward", String(255), nullable=True)
    site_id = Column("site_id", Integer, nullable=True)

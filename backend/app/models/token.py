"""Auto-generated SQLAlchemy model for `token`.

Mirrors the colorcommerce.token table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class Token(Base):
    __tablename__ = "token"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    token = Column("token", String(32), nullable=True)
    type_ = Column("type", String(5), nullable=True)
    cc_data = Column("cc_data", Text, nullable=True)
    date_created = Column("date_created", DateTime, nullable=True)
    last_requested = Column("last_requested", DateTime, nullable=True)

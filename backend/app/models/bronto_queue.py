"""Auto-generated SQLAlchemy model for `bronto_queue`.

Mirrors the colorcommerce.bronto_queue table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class BrontoQueue(Base):
    __tablename__ = "bronto_queue"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    type_ = Column("type", String(50), nullable=False)
    config_file = Column("config_file", String(50), nullable=False)
    date = Column("date", DateTime, nullable=False)
    data = Column("data", Text, nullable=False)

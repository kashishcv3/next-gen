"""Auto-generated SQLAlchemy model for `server_instructions`.

Mirrors the colorcommerce.server_instructions table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class ServerInstructions(Base):
    __tablename__ = "server_instructions"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    type_ = Column("type", String(3), nullable=True)
    instruction = Column("instruction", String(21), nullable=True)
    info = Column("info", String(255), nullable=True)
    time_added = Column("time_added", DateTime, nullable=True)

"""Auto-generated SQLAlchemy model for `server_instructions_hosts`.

Mirrors the colorcommerce.server_instructions_hosts table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class ServerInstructionsHosts(Base):
    __tablename__ = "server_instructions_hosts"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    server_instructions_id = Column("server_instructions_id", Integer, nullable=True)
    host = Column("host", String(50), nullable=True)
    completed = Column("completed", DateTime, nullable=True)

"""Auto-generated SQLAlchemy model for `hosts_updated`.

Mirrors the colorcommerce.hosts_updated table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, String
from app.database import Base


class HostsUpdated(Base):
    __tablename__ = "hosts_updated"

    host = Column("host", String(50), primary_key=True)
    last_update = Column("last_update", DateTime, nullable=True)

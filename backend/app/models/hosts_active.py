"""Auto-generated SQLAlchemy model for `hosts_active`.

Mirrors the colorcommerce.hosts_active table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, String
from app.database import Base


class HostsActive(Base):
    __tablename__ = "hosts_active"

    host = Column("host", String(50), primary_key=True)
    last_check = Column("last_check", DateTime, nullable=True)

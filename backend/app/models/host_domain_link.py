"""Auto-generated SQLAlchemy model for `host_domain_link`.

Mirrors the colorcommerce.host_domain_link table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class HostDomainLink(Base):
    __tablename__ = "host_domain_link"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    host = Column("host", String(100), nullable=True)
    staging_domain = Column("staging_domain", String(100), nullable=True)
    admin_domain = Column("admin_domain", String(100), nullable=True)
    service_domain = Column("service_domain", String(100), nullable=True)

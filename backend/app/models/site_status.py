"""Auto-generated SQLAlchemy model for `site_status`.

Mirrors the colorcommerce.site_status table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class SiteStatus(Base):
    __tablename__ = "site_status"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    status = Column("status", String(255), nullable=True)

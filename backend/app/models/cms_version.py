"""Auto-generated SQLAlchemy model for `cms_version`.

Mirrors the colorcommerce.cms_version table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class CmsVersion(Base):
    __tablename__ = "cms_version"

    store_id = Column("store_id", Integer, primary_key=True)
    last_download = Column("last_download", DateTime, nullable=True)
    version = Column("version", String(255), nullable=True)

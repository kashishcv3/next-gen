"""Auto-generated SQLAlchemy model for `social_media_product_sync`.

Mirrors the colorcommerce.social_media_product_sync table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class SocialMediaProductSync(Base):
    __tablename__ = "social_media_product_sync"

    sync_id = Column("sync_id", Integer, primary_key=True, autoincrement=True)
    site_id = Column("site_id", Integer, nullable=False)
    platform = Column("platform", String(20), nullable=False)
    product_id = Column("product_id", Integer, nullable=False)
    platform_product_id = Column("platform_product_id", String(50), nullable=True)
    last_sync = Column("last_sync", DateTime, nullable=True)
    status = Column("status", String(20), nullable=True)

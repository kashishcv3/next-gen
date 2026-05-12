"""Auto-generated SQLAlchemy model for `social_media_connections`.

Mirrors the colorcommerce.social_media_connections table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class SocialMediaConnections(Base):
    __tablename__ = "social_media_connections"

    connection_id = Column("connection_id", Integer, primary_key=True, autoincrement=True)
    site_id = Column("site_id", Integer, nullable=False)
    platform = Column("platform", String(20), nullable=False)
    access_token = Column("access_token", Text, nullable=True)
    refresh_token = Column("refresh_token", Text, nullable=True)
    token_expires = Column("token_expires", DateTime, nullable=True)
    platform_user_id = Column("platform_user_id", String(50), nullable=True)
    platform_account_name = Column("platform_account_name", String(100), nullable=True)
    status = Column("status", String(8), nullable=True)
    last_sync = Column("last_sync", DateTime, nullable=True)
    created_at = Column("created_at", DateTime, nullable=True)

"""Auto-generated SQLAlchemy model for `app_store_config`.

Mirrors the colorcommerce.app_store_config table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class AppStoreConfig(Base):
    __tablename__ = "app_store_config"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    code = Column("code", String(50), nullable=True)
    name = Column("name", String(255), nullable=True)
    description = Column("description", String(255), nullable=False)
    active = Column("active", String(1), nullable=True)
    type_ = Column("type", String(7), nullable=True)
    config = Column("config", Text, nullable=False)

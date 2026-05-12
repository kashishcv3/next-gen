"""Auto-generated SQLAlchemy model for `google_key`.

Mirrors the colorcommerce.google_key table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class GoogleKey(Base):
    __tablename__ = "google_key"

    store_id = Column("store_id", Integer, primary_key=True)
    google_key = Column("google_key", String(100), nullable=True)

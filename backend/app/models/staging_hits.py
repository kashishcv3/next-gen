"""Auto-generated SQLAlchemy model for `staging_hits`.

Mirrors the colorcommerce.staging_hits table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Date, Integer, String
from app.database import Base


class StagingHits(Base):
    __tablename__ = "staging_hits"

    store = Column("store", String(20), primary_key=True)
    hits = Column("hits", Integer, nullable=True)
    day = Column("day", Date, nullable=True)

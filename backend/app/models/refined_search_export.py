"""Auto-generated SQLAlchemy model for `refined_search_export`.

Mirrors the colorcommerce.refined_search_export table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class RefinedSearchExport(Base):
    __tablename__ = "refined_search_export"

    site_id = Column("site_id", Integer, primary_key=True)
    delimiter = Column("delimiter", String(5), nullable=True)
    email = Column("email", String(50), nullable=True)
    all_searches = Column("all_searches", String(1), nullable=True)
    search_ids = Column("search_ids", Text, nullable=True)
    last_export = Column("last_export", DateTime, nullable=True)
    current_files = Column("current_files", Text, nullable=True)

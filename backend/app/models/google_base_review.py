"""Auto-generated SQLAlchemy model for `google_base_review`.

Mirrors the colorcommerce.google_base_review table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class GoogleBaseReview(Base):
    __tablename__ = "google_base_review"

    site_id = Column("site_id", Integer, primary_key=True)
    mpn = Column("mpn", String(50), nullable=True)
    gtin = Column("gtin", String(50), nullable=True)
    products = Column("products", Text, nullable=True)
    current_files = Column("current_files", Text, nullable=True)
    last_export = Column("last_export", DateTime, nullable=True)
    email = Column("email", String(50), nullable=True)
    hide_blank = Column("hide_blank", String(1), nullable=True)
    output_file = Column("output_file", String(3), nullable=True)
    auto_feed = Column("auto_feed", String(1), nullable=False)
    auto_file_name = Column("auto_file_name", String(10), nullable=False)

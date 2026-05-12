"""Auto-generated SQLAlchemy model for `singlefeed`.

Mirrors the colorcommerce.singlefeed table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class Singlefeed(Base):
    __tablename__ = "singlefeed"

    site_id = Column("site_id", Integer, primary_key=True)
    file_name = Column("file_name", String(10), nullable=True)
    category = Column("category", String(100), nullable=True)
    manufacturer = Column("manufacturer", String(100), nullable=True)
    keywords = Column("keywords", String(100), nullable=True)
    upc = Column("upc", String(100), nullable=True)
    model = Column("model", String(100), nullable=True)
    isbn = Column("isbn", String(100), nullable=True)
    department = Column("department", String(100), nullable=True)
    color = Column("color", String(100), nullable=True)
    size = Column("size", String(100), nullable=True)
    uii = Column("uii", String(255), nullable=True)
    cpd_data = Column("cpd_data", Text, nullable=True)
    products = Column("products", Text, nullable=True)
    current_files = Column("current_files", Text, nullable=True)
    last_export = Column("last_export", DateTime, nullable=True)
    email = Column("email", String(50), nullable=True)

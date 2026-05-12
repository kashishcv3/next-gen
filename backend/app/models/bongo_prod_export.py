"""Auto-generated SQLAlchemy model for `bongo_prod_export`.

Mirrors the colorcommerce.bongo_prod_export table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class BongoProdExport(Base):
    __tablename__ = "bongo_prod_export"

    site_id = Column("site_id", Integer, primary_key=True)
    email = Column("email", String(100), nullable=True)
    file = Column("file", String(15), nullable=True)
    language = Column("language", String(2), nullable=True)
    prod_name = Column("prod_name", String(50), nullable=True)
    special_price = Column("special_price", String(1), nullable=True)
    origin_country = Column("origin_country", String(50), nullable=True)
    hs_code = Column("hs_code", String(50), nullable=True)
    eccn = Column("eccn", String(50), nullable=True)
    hazardous = Column("hazardous", String(50), nullable=True)
    license_flag = Column("license_flag", Text, nullable=True)
    import_flag = Column("import_flag", Text, nullable=True)
    product_type = Column("product_type", String(50), nullable=True)
    products = Column("products", Text, nullable=True)
    exclude_products = Column("exclude_products", Text, nullable=True)

"""Auto-generated SQLAlchemy model for `sli_export`.

Mirrors the colorcommerce.sli_export table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class SliExport(Base):
    __tablename__ = "sli_export"

    site_id = Column("site_id", Integer, primary_key=True)
    product_ids = Column("product_ids", Text, nullable=True)
    order_by = Column("order_by", String(4), nullable=True)
    image = Column("image", String(6), nullable=True)
    custom_image = Column("custom_image", String(255), nullable=True)
    additional = Column("additional", String(30), nullable=True)
    email = Column("email", String(50), nullable=True)
    default_category = Column("default_category", String(1), nullable=False)
    cat_ids = Column("cat_ids", Text, nullable=True)

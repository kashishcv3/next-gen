"""Auto-generated SQLAlchemy model for `product_export`.

Mirrors the colorcommerce.product_export table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Date, DateTime, Integer, String, Text
from app.database import Base


class ProductExport(Base):
    __tablename__ = "product_export"

    site_id = Column("site_id", Integer, primary_key=True)
    product_ids = Column("product_ids", Text, nullable=True)
    order_by = Column("order_by", String(100), nullable=True)
    delimiter = Column("delimiter", String(1), nullable=True)
    images = Column("images", String(1), nullable=True)
    electronic_delivery = Column("electronic_delivery", String(1), nullable=True)
    cat_filters = Column("cat_filters", String(1), nullable=True)
    image_edit_type = Column("image_edit_type", String(11), nullable=True)
    current_files = Column("current_files", Text, nullable=True)
    last_export = Column("last_export", DateTime, nullable=True)
    email = Column("email", String(50), nullable=True)
    cat_ids = Column("cat_ids", Text, nullable=True)
    include_freight = Column("include_freight", String(1), nullable=False)
    custom_field_data = Column("custom_field_data", String(1), nullable=False)
    created_date = Column("created_date", Date, nullable=True)

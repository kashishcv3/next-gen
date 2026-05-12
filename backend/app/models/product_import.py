"""Auto-generated SQLAlchemy model for `product_import`.

Mirrors the colorcommerce.product_import table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class ProductImport(Base):
    __tablename__ = "product_import"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    site_id = Column("site_id", Integer, nullable=True)
    email = Column("email", String(255), nullable=True)
    delimiter = Column("delimiter", String(5), nullable=True)
    regex_type = Column("regex_type", String(7), nullable=True)
    regex = Column("regex", String(100), nullable=True)
    char_set = Column("char_set", String(10), nullable=True)
    update_name = Column("update_name", String(1), nullable=True)
    update_desc = Column("update_desc", String(1), nullable=True)
    add_top = Column("add_top", String(1), nullable=True)
    update_special = Column("update_special", String(1), nullable=True)
    ignore_oo = Column("ignore_oo", String(1), nullable=True)
    update_existing = Column("update_existing", String(1), nullable=True)

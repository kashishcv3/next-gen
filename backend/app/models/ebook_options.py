"""Auto-generated SQLAlchemy model for `ebook_options`.

Mirrors the colorcommerce.ebook_options table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class EbookOptions(Base):
    __tablename__ = "ebook_options"

    site_id = Column("site_id", Integer, primary_key=True)
    masterpoint_enable = Column("masterpoint_enable", String(1), nullable=False)
    masterpoint_environment = Column("masterpoint_environment", String(10), nullable=False)
    masterpoint_vendorid = Column("masterpoint_vendorid", String(100), nullable=True)
    masterpoint_privatekey = Column("masterpoint_privatekey", String(2100), nullable=True)

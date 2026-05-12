"""Auto-generated SQLAlchemy model for `tax_options`.

Mirrors the colorcommerce.tax_options table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class TaxOptions(Base):
    __tablename__ = "tax_options"

    site_id = Column("site_id", Integer, primary_key=True)
    tax_discount = Column("tax_discount", String(1), nullable=True)
    tax_orderlevel_fees = Column("tax_orderlevel_fees", String(150), nullable=True)
    api_tax_states = Column("api_tax_states", String(150), nullable=True)
    api_tax_states_alt = Column("api_tax_states_alt", String(1), nullable=True)

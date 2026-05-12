"""Auto-generated SQLAlchemy model for `growth_options`.

Mirrors the colorcommerce.growth_options table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class GrowthOptions(Base):
    __tablename__ = "growth_options"

    site_id = Column("site_id", Integer, primary_key=True)
    blast_unresponsive = Column("blast_unresponsive", Integer, nullable=True)
    cart_abandon = Column("cart_abandon", String(6), nullable=True)
    cart_abandon_days = Column("cart_abandon_days", Integer, nullable=True)
    cart_abandon_from = Column("cart_abandon_from", String(255), nullable=True)
    cart_abandon_subject = Column("cart_abandon_subject", String(50), nullable=True)
    cart_abandon_remove = Column("cart_abandon_remove", String(8), nullable=True)
    cart_abandon_optout = Column("cart_abandon_optout", String(1), nullable=True)

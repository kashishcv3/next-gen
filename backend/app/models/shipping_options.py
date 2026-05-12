"""Auto-generated SQLAlchemy model for `shipping_options`.

Mirrors the colorcommerce.shipping_options table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class ShippingOptions(Base):
    __tablename__ = "shipping_options"

    site_id = Column("site_id", Integer, primary_key=True)
    ship_calc = Column("ship_calc", String(5), nullable=True)
    ship_calculator = Column("ship_calculator", String(1), nullable=True)
    vendor_ship_calc = Column("vendor_ship_calc", String(1), nullable=True)
    use_ship_on = Column("use_ship_on", String(1), nullable=True)
    shipping_type = Column("shipping_type", String(4), nullable=True)
    ship_territories = Column("ship_territories", String(1), nullable=True)
    ship_apo = Column("ship_apo", String(1), nullable=True)
    ship_address_confirm = Column("ship_address_confirm", String(2), nullable=True)
    ship_address_member_copy = Column("ship_address_member_copy", String(1), nullable=True)
    ship_address_confirm_real = Column("ship_address_confirm_real", String(2), nullable=True)
    ship_address_confirm_real_key = Column("ship_address_confirm_real_key", String(20), nullable=True)
    ship_address_confirm_real_key_live = Column("ship_address_confirm_real_key_live", String(20), nullable=True)
    shipworks_enable = Column("shipworks_enable", String(1), nullable=True)
    shipworks_statuscodes = Column("shipworks_statuscodes", String(255), nullable=True)
    origin_address = Column("origin_address", Text, nullable=True)

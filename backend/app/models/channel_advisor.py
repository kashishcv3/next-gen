"""Auto-generated SQLAlchemy model for `channel_advisor`.

Mirrors the colorcommerce.channel_advisor table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class ChannelAdvisor(Base):
    __tablename__ = "channel_advisor"

    site_id = Column("site_id", Integer, primary_key=True, autoincrement=True)
    file_name = Column("file_name", String(10), nullable=True)
    manufacturer = Column("manufacturer", String(50), nullable=True)
    brand = Column("brand", String(50), nullable=True)
    manufacturer_num = Column("manufacturer_num", String(50), nullable=True)
    special_prices = Column("special_prices", String(1), nullable=True)
    products = Column("products", Text, nullable=True)
    decode_html_entity = Column("decode_html_entity", String(1), nullable=True)
    extra_prices = Column("extra_prices", String(1), nullable=True)

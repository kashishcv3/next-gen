"""Auto-generated SQLAlchemy model for `shipping_codes`.

Mirrors the colorcommerce.shipping_codes table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class ShippingCodes(Base):
    __tablename__ = "shipping_codes"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    code = Column("code", String(30), nullable=True)
    method = Column("method", String(100), nullable=True)

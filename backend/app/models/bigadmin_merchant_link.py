"""Auto-generated SQLAlchemy model for `bigadmin_merchant_link`.

Mirrors the colorcommerce.bigadmin_merchant_link table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class BigadminMerchantLink(Base):
    __tablename__ = "bigadmin_merchant_link"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    type_ = Column("type", String(20), nullable=True)
    user_id = Column("user_id", Integer, nullable=True)

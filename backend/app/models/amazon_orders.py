"""Auto-generated SQLAlchemy model for `amazon_orders`.

Mirrors the colorcommerce.amazon_orders table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class AmazonOrders(Base):
    __tablename__ = "amazon_orders"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    amazon_id = Column("amazon_id", String(255), nullable=True)
    order_id = Column("order_id", Integer, nullable=True)
    site_id = Column("site_id", Integer, nullable=True)
    readytoship = Column("readytoship", String(1), nullable=True)
    date_ordered = Column("date_ordered", DateTime, nullable=False)

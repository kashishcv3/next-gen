"""Auto-generated SQLAlchemy model for `subscription_stores`.

Mirrors the colorcommerce.subscription_stores table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer
from app.database import Base


class SubscriptionStores(Base):
    __tablename__ = "subscription_stores"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    store_id = Column("store_id", Integer, nullable=True)

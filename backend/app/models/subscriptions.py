"""Auto-generated SQLAlchemy model for `subscriptions`.

Mirrors the colorcommerce.subscriptions table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Float, Integer, String
from app.database import Base


class Subscriptions(Base):
    __tablename__ = "subscriptions"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    name = Column("name", String(255), nullable=True)
    subscription_fee = Column("subscription_fee", Float, nullable=True)
    data_conversion = Column("data_conversion", Float, nullable=True)
    site_conversion = Column("site_conversion", Float, nullable=True)
    store_templates = Column("store_templates", Float, nullable=True)
    email_marketing = Column("email_marketing", Float, nullable=True)
    email_campaign = Column("email_campaign", Float, nullable=True)
    content_modification = Column("content_modification", Float, nullable=True)
    custom_design = Column("custom_design", Float, nullable=True)

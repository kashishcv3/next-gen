"""Auto-generated SQLAlchemy model for `feature_descriptions`.

Mirrors the colorcommerce.feature_descriptions table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Date, String, Text
from app.database import Base


class FeatureDescriptions(Base):
    __tablename__ = "feature_descriptions"

    name = Column("name", String(255), primary_key=True)
    build = Column("build", String(10), nullable=True)
    title = Column("title", String(255), nullable=True)
    description = Column("description", Text, nullable=True)
    date_entered = Column("date_entered", Date, nullable=True)
    cost = Column("cost", String(255), nullable=True)
    link = Column("link", String(100), nullable=True)
    info = Column("info", Text, nullable=True)
    live = Column("live", String(1), nullable=True)
    noupgrade = Column("noupgrade", String(1), nullable=True)
    type_ = Column("type", String(11), nullable=True)
    dashboard = Column("dashboard", String(1), nullable=True)
    prereqs = Column("prereqs", Text, nullable=True)

"""Auto-generated SQLAlchemy model for `feature_access`.

Mirrors the colorcommerce.feature_access table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class FeatureAccess(Base):
    __tablename__ = "feature_access"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    site_id = Column("site_id", Integer, nullable=True)
    feature_name = Column("feature_name", String(255), nullable=True)
    allowed = Column("allowed", String(1), nullable=True)

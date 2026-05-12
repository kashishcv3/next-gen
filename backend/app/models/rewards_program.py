"""Auto-generated SQLAlchemy model for `rewards_program`.

Mirrors the colorcommerce.rewards_program table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Float, Integer, String
from app.database import Base


class RewardsProgram(Base):
    __tablename__ = "rewards_program"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    site_id = Column("site_id", Integer, nullable=True)
    spent_points = Column("spent_points", Integer, nullable=True)
    spent_amount = Column("spent_amount", Float, nullable=True)
    prod_points = Column("prod_points", Integer, nullable=True)
    prod_amount = Column("prod_amount", Integer, nullable=True)
    skip_payment_methods = Column("skip_payment_methods", String(255), nullable=True)

"""Auto-generated SQLAlchemy model for `contract_activities`.

Mirrors the colorcommerce.contract_activities table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class ContractActivities(Base):
    __tablename__ = "contract_activities"

    contract_id = Column("contract_id", Integer, primary_key=True)
    username = Column("username", String(255), nullable=False)
    agreed_to = Column("agreed_to", String(10), nullable=False)
    disagreements = Column("disagreements", Integer, nullable=False)
    last_activity = Column("last_activity", String(25), nullable=True)
    store_id = Column("store_id", Integer, nullable=False)

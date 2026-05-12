"""Auto-generated SQLAlchemy model for `store_contracts`.

Mirrors the colorcommerce.store_contracts table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class StoreContracts(Base):
    __tablename__ = "store_contracts"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    name = Column("name", String(255), nullable=False)
    date_uploaded = Column("date_uploaded", DateTime, nullable=False)
    active = Column("active", String(1), nullable=True)

"""Auto-generated SQLAlchemy model for `crypto`.

Mirrors the colorcommerce.crypto table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, LargeBinary, String
from app.database import Base


class Crypto(Base):
    __tablename__ = "crypto"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    description = Column("description", String(100), nullable=True)
    crypto_key = Column("crypto_key", LargeBinary, nullable=True)
    date_created = Column("date_created", DateTime, nullable=True)

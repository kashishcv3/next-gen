"""Auto-generated SQLAlchemy model for `gpg_key`.

Mirrors the colorcommerce.gpg_key table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class GpgKey(Base):
    __tablename__ = "gpg_key"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    name = Column("name", String(50), nullable=True)
    fingerprint = Column("fingerprint", String(50), nullable=True)
    passphrase = Column("passphrase", String(50), nullable=True)
    active = Column("active", String(1), nullable=True)

"""Auto-generated SQLAlchemy model for `websvc_keys_alt`.

Mirrors the colorcommerce.websvc_keys_alt table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class WebsvcKeysAlt(Base):
    __tablename__ = "websvc_keys_alt"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    username = Column("username", String(50), nullable=False)
    type_ = Column("type", String(6), nullable=True)
    websvc_key = Column("websvc_key", String(100), nullable=True)
    websvc_secret = Column("websvc_secret", String(100), nullable=True)
    lockout_count = Column("lockout_count", Integer, nullable=True)
    lockout_when = Column("lockout_when", DateTime, nullable=True)
    websvc_key_changed = Column("websvc_key_changed", DateTime, nullable=True)

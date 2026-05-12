"""Auto-generated SQLAlchemy model for `webservice_lockout`.

Mirrors the colorcommerce.webservice_lockout table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Boolean, Column, Integer, String
from app.database import Base


class WebserviceLockout(Base):
    __tablename__ = "webservice_lockout"

    username = Column("username", String(50), primary_key=True)
    fail_count = Column("fail_count", Boolean, nullable=True)
    last_attempt = Column("last_attempt", Integer, nullable=True)
    source = Column("source", String(15), nullable=False)

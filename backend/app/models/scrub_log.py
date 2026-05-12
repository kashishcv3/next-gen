"""Auto-generated SQLAlchemy model for `scrub_log`.

Mirrors the colorcommerce.scrub_log table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class ScrubLog(Base):
    __tablename__ = "scrub_log"

    store_id = Column("store_id", Integer, primary_key=True)
    user_id = Column("user_id", Integer, nullable=True)
    mar_id = Column("mar_id", Integer, nullable=True)
    email = Column("email", String(255), nullable=True)
    date_scrubbed = Column("date_scrubbed", DateTime, nullable=True)

"""Auto-generated SQLAlchemy model for `cron_scripts`.

Mirrors the colorcommerce.cron_scripts table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class CronScripts(Base):
    __tablename__ = "cron_scripts"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    script = Column("script", String(100), nullable=True)
    host = Column("host", String(25), nullable=True)
    type_ = Column("type", String(20), nullable=True)
    verify_complete = Column("verify_complete", String(255), nullable=False)

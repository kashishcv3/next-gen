"""Auto-generated SQLAlchemy model for `sendgrid_accts`.

Mirrors the colorcommerce.sendgrid_accts table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class SendgridAccts(Base):
    __tablename__ = "sendgrid_accts"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    site_id = Column("site_id", Integer, nullable=True)
    from_account = Column("from_account", String(50), nullable=True)
    api_key = Column("api_key", String(100), nullable=True)

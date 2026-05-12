"""Auto-generated SQLAlchemy model for `removal_sheets`.

Mirrors the colorcommerce.removal_sheets table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from app.database import Base


class RemovalSheets(Base):
    __tablename__ = "removal_sheets"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    store_id = Column("store_id", Integer, nullable=False)
    removed_dns = Column("removed_dns", Boolean, nullable=True)
    removed_elb = Column("removed_elb", Boolean, nullable=True)
    removed_ssl = Column("removed_ssl", Boolean, nullable=True)
    left_admin = Column("left_admin", Boolean, nullable=True)
    marked_unlive = Column("marked_unlive", Boolean, nullable=True)
    backup_made = Column("backup_made", Boolean, nullable=True)
    rackspace = Column("rackspace", Boolean, nullable=True)
    cv3_email = Column("cv3_email", Boolean, nullable=True)
    notes = Column("notes", Text, nullable=True)
    date = Column("date", DateTime, nullable=True)
    modify_id = Column("modify_id", Integer, nullable=True)
    removed = Column("removed", String(1), nullable=False)
    name = Column("name", String(255), nullable=True)

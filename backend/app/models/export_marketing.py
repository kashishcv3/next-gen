"""Auto-generated SQLAlchemy model for `export_marketing`.

Mirrors the colorcommerce.export_marketing table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class ExportMarketing(Base):
    __tablename__ = "export_marketing"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    site_id = Column("site_id", Integer, nullable=True)
    file_name = Column("file_name", String(50), nullable=True)
    start_date = Column("start_date", DateTime, nullable=True)
    end_date = Column("end_date", DateTime, nullable=True)
    cust_type = Column("cust_type", Text, nullable=True)
    names = Column("names", String(10), nullable=True)
    source = Column("source", String(25), nullable=True)
    v_inout = Column("v_inout", String(25), nullable=True)
    v_info = Column("v_info", String(5), nullable=True)
    members_only = Column("members_only", String(5), nullable=True)
    created = Column("created", DateTime, nullable=True)
    cgroup_date = Column("cgroup_date", String(1), nullable=True)
    cust_date = Column("cust_date", String(1), nullable=True)
    cust_fields = Column("cust_fields", String(1), nullable=True)

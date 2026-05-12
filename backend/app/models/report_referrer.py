"""Auto-generated SQLAlchemy model for `report_referrer`.

Mirrors the colorcommerce.report_referrer table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class ReportReferrer(Base):
    __tablename__ = "report_referrer"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    site_id = Column("site_id", Integer, nullable=True)
    file_name = Column("file_name", String(60), nullable=True)
    start_date = Column("start_date", DateTime, nullable=True)
    end_date = Column("end_date", DateTime, nullable=True)
    sort_by = Column("sort_by", String(50), nullable=True)
    min_num = Column("min_num", Integer, nullable=True)
    min_type = Column("min_type", String(25), nullable=True)
    keywords = Column("keywords", String(1), nullable=True)
    created = Column("created", DateTime, nullable=True)

"""Auto-generated SQLAlchemy model for `report_emails`.

Mirrors the colorcommerce.report_emails table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, Text
from app.database import Base


class ReportEmails(Base):
    __tablename__ = "report_emails"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    site_id = Column("site_id", Integer, nullable=True)
    emails = Column("emails", Text, nullable=True)

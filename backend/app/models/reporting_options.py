"""Auto-generated SQLAlchemy model for `reporting_options`.

Mirrors the colorcommerce.reporting_options table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Float, Integer, String, Text
from app.database import Base


class ReportingOptions(Base):
    __tablename__ = "reporting_options"

    site_id = Column("site_id", Integer, primary_key=True)
    affiliate_override = Column("affiliate_override", String(1), nullable=True)
    report_value = Column("report_value", String(7), nullable=True)
    google_analytics = Column("google_analytics", String(1), nullable=True)
    google_analytics_acct = Column("google_analytics_acct", String(100), nullable=True)
    desc_rep_filter = Column("desc_rep_filter", Text, nullable=True)
    rep_filter = Column("rep_filter", Text, nullable=True)
    affiliate_report = Column("affiliate_report", String(1), nullable=True)
    affiliate_report_email = Column("affiliate_report_email", String(100), nullable=True)
    affiliate_report_subject = Column("affiliate_report_subject", String(50), nullable=True)
    affiliate_report_from = Column("affiliate_report_from", String(50), nullable=True)
    affiliate_forgot_subject = Column("affiliate_forgot_subject", String(50), nullable=True)
    affiliate_forgot_from = Column("affiliate_forgot_from", String(50), nullable=True)
    referafriend_from = Column("referafriend_from", String(100), nullable=True)
    referafriend_subject = Column("referafriend_subject", String(100), nullable=True)
    referafriend_type = Column("referafriend_type", String(10), nullable=True)
    referafriend_commission = Column("referafriend_commission", Float, nullable=True)
    referafriend_expiration = Column("referafriend_expiration", Integer, nullable=True)
    referafriend_firstorder = Column("referafriend_firstorder", String(1), nullable=True)
    referafriend_sample_subject = Column("referafriend_sample_subject", String(100), nullable=True)
    eparty_from = Column("eparty_from", String(100), nullable=True)
    eparty_subject = Column("eparty_subject", String(100), nullable=True)
    eparty_type = Column("eparty_type", String(10), nullable=True)
    eparty_firstorder = Column("eparty_firstorder", String(1), nullable=True)
    eparty_commission = Column("eparty_commission", Float, nullable=True)
    eparty_sample_subject = Column("eparty_sample_subject", String(100), nullable=True)

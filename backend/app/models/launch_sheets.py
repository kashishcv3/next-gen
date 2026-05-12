"""Auto-generated SQLAlchemy model for `launch_sheets`.

Mirrors the colorcommerce.launch_sheets table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Boolean, Column, Date, DateTime, Integer, String, Text
from app.database import Base


class LaunchSheets(Base):
    __tablename__ = "launch_sheets"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    store_id = Column("store_id", Integer, nullable=False)
    store_domain = Column("store_domain", String(255), nullable=True)
    company = Column("company", String(255), nullable=True)
    contact_email = Column("contact_email", String(255), nullable=True)
    address = Column("address", Text, nullable=True)
    dns_hosted = Column("dns_hosted", Boolean, nullable=True)
    dns_entries = Column("dns_entries", Text, nullable=True)
    store_protocol = Column("store_protocol", String(15), nullable=True)
    email_hosted = Column("email_hosted", Boolean, nullable=True)
    email_configured = Column("email_configured", Boolean, nullable=True)
    redirect_domains = Column("redirect_domains", Boolean, nullable=True)
    additional_domains = Column("additional_domains", Text, nullable=True)
    additional_dns_hosted = Column("additional_dns_hosted", Boolean, nullable=True)
    additional_dns_entries = Column("additional_dns_entries", Text, nullable=True)
    additional_email_hosted = Column("additional_email_hosted", Boolean, nullable=True)
    additional_email_configured = Column("additional_email_configured", Boolean, nullable=True)
    launch = Column("launch", Integer, nullable=False)
    modify_id = Column("modify_id", Integer, nullable=True)
    modified = Column("modified", DateTime, nullable=False)
    created_id = Column("created_id", Integer, nullable=True)
    estimated_launch = Column("estimated_launch", Date, nullable=True)
    launch_hour = Column("launch_hour", Integer, nullable=True)
    launch_day = Column("launch_day", String(10), nullable=True)
    starting_order_num = Column("starting_order_num", String(10), nullable=True)
    notes = Column("notes", Text, nullable=True)

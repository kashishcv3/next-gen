"""Auto-generated SQLAlchemy model for `mail_queue`.

Mirrors the colorcommerce.mail_queue table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class MailQueue(Base):
    __tablename__ = "mail_queue"

    store_id = Column("store_id", Integer, primary_key=True)
    blast_id = Column("blast_id", Integer, nullable=True)
    uid = Column("uid", Integer, nullable=True)
    to_address = Column("to_address", String(255), nullable=True)
    from_address = Column("from_address", String(255), nullable=True)
    subject = Column("subject", String(255), nullable=True)
    email = Column("email", Text, nullable=True)
    add_date = Column("add_date", DateTime, nullable=True)
    send_date = Column("send_date", DateTime, nullable=True)

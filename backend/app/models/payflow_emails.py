"""Auto-generated SQLAlchemy model for `payflow_emails`.

Mirrors the colorcommerce.payflow_emails table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class PayflowEmails(Base):
    __tablename__ = "payflow_emails"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    to_address = Column("to_address", String(255), nullable=True)
    subject = Column("subject", String(255), nullable=True)
    body = Column("body", Text, nullable=True)
    headers = Column("headers", String(255), nullable=True)
    f = Column("f", String(255), nullable=True)
    order_id = Column("order_id", Integer, nullable=True)
    conf = Column("conf", String(50), nullable=True)

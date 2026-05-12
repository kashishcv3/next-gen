"""Auto-generated SQLAlchemy model for `product_qanda`.

Mirrors the colorcommerce.product_qanda table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class ProductQanda(Base):
    __tablename__ = "product_qanda"

    site_id = Column("site_id", Integer, primary_key=True)
    modified = Column("modified", DateTime, nullable=True)
    qanda_ask_usegroups = Column("qanda_ask_usegroups", String(1), nullable=True)
    qanda_ask_groups = Column("qanda_ask_groups", Text, nullable=True)
    qanda_answer_usegroups = Column("qanda_answer_usegroups", String(1), nullable=True)
    qanda_answer_groups = Column("qanda_answer_groups", Text, nullable=True)
    qanda_approve = Column("qanda_approve", String(2), nullable=True)
    qanda_ask_addcg = Column("qanda_ask_addcg", String(1), nullable=True)
    qanda_ask_cg = Column("qanda_ask_cg", Integer, nullable=True)
    qanda_answer_addcg = Column("qanda_answer_addcg", String(1), nullable=True)
    qanda_answer_cg = Column("qanda_answer_cg", Integer, nullable=True)
    qanda_ask_thanks = Column("qanda_ask_thanks", String(1), nullable=True)
    qanda_answer_thanks = Column("qanda_answer_thanks", String(1), nullable=True)
    qanda_ask_email = Column("qanda_ask_email", String(1), nullable=True)
    qanda_ask_subject = Column("qanda_ask_subject", String(255), nullable=True)
    qanda_ask_from = Column("qanda_ask_from", String(100), nullable=True)
    qanda_answer_email = Column("qanda_answer_email", String(1), nullable=True)
    qanda_answer_subject = Column("qanda_answer_subject", String(255), nullable=True)
    qanda_answer_from = Column("qanda_answer_from", String(100), nullable=True)
    qanda_contact_name = Column("qanda_contact_name", String(50), nullable=True)
    qanda_contact_email = Column("qanda_contact_email", String(100), nullable=True)
    qanda_contact_me = Column("qanda_contact_me", String(1), nullable=True)
    qanda_response_email = Column("qanda_response_email", String(1), nullable=False)
    qanda_response_subject = Column("qanda_response_subject", String(255), nullable=True)
    qanda_response_from = Column("qanda_response_from", String(100), nullable=True)

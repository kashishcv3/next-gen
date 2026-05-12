"""Auto-generated SQLAlchemy model for `tokenize_auth_stragglers`.

Mirrors the colorcommerce.tokenize_auth_stragglers table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class TokenizeAuthStragglers(Base):
    __tablename__ = "tokenize_auth_stragglers"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    site_id = Column("site_id", Integer, nullable=True)
    order_id = Column("order_id", Integer, nullable=True)
    try_ = Column("try", Integer, nullable=True)
    date_added = Column("date_added", DateTime, nullable=True)
    token = Column("token", String(32), nullable=True)
    auth = Column("auth", String(50), nullable=True)

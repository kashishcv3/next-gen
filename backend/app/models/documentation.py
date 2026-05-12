"""Auto-generated SQLAlchemy model for `documentation`.

Mirrors the colorcommerce.documentation table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class Documentation(Base):
    __tablename__ = "documentation"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    page_help = Column("page_help", Text, nullable=True)
    page_name = Column("page_name", String(255), nullable=True)
    view = Column("view", String(255), nullable=True)
    tutorial = Column("tutorial", String(255), nullable=True)

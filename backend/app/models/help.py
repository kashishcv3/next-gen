"""Auto-generated SQLAlchemy model for `help`.

Mirrors the colorcommerce.help table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class Help(Base):
    __tablename__ = "help"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    page = Column("page", String(50), nullable=True)
    document = Column("document", String(100), nullable=True)
    name = Column("name", String(100), nullable=True)

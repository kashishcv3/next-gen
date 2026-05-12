"""Auto-generated SQLAlchemy model for `template_names`.

Mirrors the colorcommerce.template_names table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class TemplateNames(Base):
    __tablename__ = "template_names"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    template = Column("template", String(255), nullable=True)
    template_name = Column("template_name", String(255), nullable=True)
    category = Column("category", String(255), nullable=True)
    type_ = Column("type", String(1), nullable=True)

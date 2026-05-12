"""Auto-generated SQLAlchemy model for `template_names_admin`.

Mirrors the colorcommerce.template_names_admin table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class TemplateNamesAdmin(Base):
    __tablename__ = "template_names_admin"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    template = Column("template", String(255), nullable=True)
    template_name = Column("template_name", String(255), nullable=True)
    documentation_info = Column("documentation_info", Text, nullable=True)
    subsection = Column("subsection", Text, nullable=True)

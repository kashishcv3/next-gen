"""Auto-generated SQLAlchemy model for `documentation_fields`.

Mirrors the colorcommerce.documentation_fields table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class DocumentationFields(Base):
    __tablename__ = "documentation_fields"

    field_id = Column("field_id", Integer, primary_key=True, autoincrement=True)
    documentation_id = Column("documentation_id", Integer, nullable=True)
    field_name = Column("field_name", String(255), nullable=True)
    description = Column("description", Text, nullable=True)
    new = Column("new", String(1), nullable=True)
    field_order = Column("field_order", Integer, nullable=True)

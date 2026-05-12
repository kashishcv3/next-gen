"""Auto-generated SQLAlchemy model for `edelivery`.

Mirrors the colorcommerce.edelivery table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class Edelivery(Base):
    __tablename__ = "edelivery"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    token = Column("token", String(16), nullable=False)
    path = Column("path", String(255), nullable=False)
    delivered = Column("delivered", String(1), nullable=False)
    date_delivered = Column("date_delivered", DateTime, nullable=True)
    file_name = Column("file_name", String(255), nullable=True)
    config_file = Column("config_file", String(100), nullable=True)
    email = Column("email", String(255), nullable=True)

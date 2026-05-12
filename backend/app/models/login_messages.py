"""Auto-generated SQLAlchemy model for `login_messages`.

Mirrors the colorcommerce.login_messages table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class LoginMessages(Base):
    __tablename__ = "login_messages"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    login = Column("login", String(10), nullable=True)
    message = Column("message", Text, nullable=True)

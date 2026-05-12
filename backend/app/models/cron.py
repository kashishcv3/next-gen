"""Auto-generated SQLAlchemy model for `cron`.

Mirrors the colorcommerce.cron table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class Cron(Base):
    __tablename__ = "cron"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    script_path = Column("script_path", String(255), nullable=True)
    arg1 = Column("arg1", String(255), nullable=True)
    arg2 = Column("arg2", String(255), nullable=True)
    arg3 = Column("arg3", String(255), nullable=True)
    arg4 = Column("arg4", String(255), nullable=True)
    arg5 = Column("arg5", String(255), nullable=True)
    arg6 = Column("arg6", String(255), nullable=True)
    arg7 = Column("arg7", String(255), nullable=True)
    arg8 = Column("arg8", String(255), nullable=True)
    arg9 = Column("arg9", String(255), nullable=True)
    date = Column("date", DateTime, nullable=True)
    type_ = Column("type", String(255), nullable=True)
    select_statement = Column("select_statement", Text, nullable=True)
    valid = Column("valid", String(1), nullable=True)
    arg10 = Column("arg10", String(255), nullable=True)
    arg11 = Column("arg11", String(255), nullable=True)
    arg12 = Column("arg12", String(255), nullable=True)
    arg13 = Column("arg13", String(255), nullable=True)
    arg14 = Column("arg14", String(255), nullable=True)
    arg15 = Column("arg15", String(255), nullable=True)

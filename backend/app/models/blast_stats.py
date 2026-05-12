"""Auto-generated SQLAlchemy model for `blast_stats`.

Mirrors the colorcommerce.blast_stats table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class BlastStats(Base):
    __tablename__ = "blast_stats"

    store_id = Column("store_id", Integer, nullable=True)
    blast_id = Column("blast_id", Integer, nullable=True)
    num_sent = Column("num_sent", Integer, nullable=True)
    num_tests_sent = Column("num_tests_sent", Integer, nullable=True)
    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    date_sent = Column("date_sent", DateTime, nullable=True)
    last_modified = Column("last_modified", DateTime, nullable=True)
    estimated_start = Column("estimated_start", DateTime, nullable=True)
    estimated_total = Column("estimated_total", Integer, nullable=True)
    estimated_sent = Column("estimated_sent", Integer, nullable=True)
    estimated_size = Column("estimated_size", Integer, nullable=True)
    send_server = Column("send_server", String(100), nullable=True)
    db_server = Column("db_server", String(100), nullable=True)

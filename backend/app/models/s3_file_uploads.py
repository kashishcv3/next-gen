"""Auto-generated SQLAlchemy model for `s3_file_uploads`.

Mirrors the colorcommerce.s3_file_uploads table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class S3FileUploads(Base):
    __tablename__ = "s3_file_uploads"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    site_id = Column("site_id", Integer, nullable=True)
    original_filename = Column("original_filename", String(255), nullable=True)
    s3_filename = Column("s3_filename", String(255), nullable=True)
    date = Column("date", DateTime, nullable=True)

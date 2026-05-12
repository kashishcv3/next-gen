"""Auto-generated SQLAlchemy model for `sites_ext`.

Mirrors the colorcommerce.sites_ext table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Float, Integer, String, Text
from app.database import Base


class SitesExt(Base):
    __tablename__ = "sites_ext"

    id_ = Column("id", Integer, primary_key=True)
    username = Column("username", String(255), nullable=True)
    password = Column("password", String(255), nullable=True)
    option1 = Column("option1", String(255), nullable=True)
    option2 = Column("option2", String(255), nullable=True)
    option3 = Column("option3", String(255), nullable=True)
    option4 = Column("option4", String(255), nullable=True)
    option5 = Column("option5", String(255), nullable=True)
    active = Column("active", String(1), nullable=True)
    type_ = Column("type", String(50), nullable=True)
    auth_full_amount = Column("auth_full_amount", String(1), nullable=True)
    auth_x_days = Column("auth_x_days", Integer, nullable=True)
    service_location = Column("service_location", String(255), nullable=True)
    avs_mismatch = Column("avs_mismatch", String(7), nullable=True)
    partner = Column("partner", String(100), nullable=True)
    security_key = Column("security_key", Text, nullable=True)
    get_token = Column("get_token", String(1), nullable=True)
    auth_amount = Column("auth_amount", Float, nullable=True)
    custom_fields = Column("custom_fields", Text, nullable=True)
    payer_auth = Column("payer_auth", String(1), nullable=True)

"""Auto-generated SQLAlchemy model for `city_state_zip`.

Mirrors the colorcommerce.city_state_zip table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Numeric, String
from app.database import Base


class CityStateZip(Base):
    __tablename__ = "city_state_zip"

    zip = Column("zip", String(6), primary_key=True)
    city = Column("city", String(255), nullable=True)
    county = Column("county", String(255), nullable=True)
    state = Column("state", String(2), nullable=True)
    lat = Column("lat", Numeric(9, 6), nullable=True)
    lon = Column("lon", Numeric(9, 6), nullable=True)

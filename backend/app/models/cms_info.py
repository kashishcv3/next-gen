"""Auto-generated SQLAlchemy model for `cms_info`.

Mirrors the colorcommerce.cms_info table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class CmsInfo(Base):
    __tablename__ = "cms_info"

    id_ = Column("id", Integer, primary_key=True, autoincrement=True)
    first_name = Column("first_name", String(255), nullable=True)
    last_name = Column("last_name", String(255), nullable=True)
    email = Column("email", String(255), nullable=True)
    company = Column("company", String(255), nullable=True)
    address1 = Column("address1", String(255), nullable=True)
    address2 = Column("address2", String(255), nullable=True)
    city = Column("city", String(100), nullable=True)
    state = Column("state", String(100), nullable=True)
    zip = Column("zip", String(100), nullable=True)
    phone = Column("phone", String(100), nullable=True)
    fax = Column("fax", String(100), nullable=True)
    customer_number = Column("customer_number", Integer, nullable=True)
    activation_code = Column("activation_code", String(255), nullable=True)
    validation_code = Column("validation_code", String(255), nullable=True)

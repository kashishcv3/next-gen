from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base


class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    display_name = Column(String(255))
    date_created = Column(DateTime)
    is_live = Column(String(1))
    domain = Column(String(255))
    secure_domain = Column(String(255))
    bill = Column(String(1))
    bill_note = Column(String(255))
    in_cloud = Column(String(1), default="n")
    admin_host = Column(String(255))


class UserSite(Base):
    __tablename__ = "users_sites"

    id = Column(Integer, primary_key=True, index=True)
    uid = Column(Integer, index=True)
    site_id = Column(Integer, index=True)
    creator_id = Column(Integer)


class UserAdmin(Base):
    __tablename__ = "users_admins"

    uid = Column(Integer, primary_key=True, index=True)
    admin = Column(String(255))

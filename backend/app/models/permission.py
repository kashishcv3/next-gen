from sqlalchemy import Column, Integer, ForeignKey
from app.database import Base


class Permission(Base):
    __tablename__ = "perms"

    uid = Column(Integer, ForeignKey("users.uid"), primary_key=True, index=True)
    page_id = Column(Integer, primary_key=True, index=True)

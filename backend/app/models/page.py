from sqlalchemy import Column, Integer, String
from app.database import Base


class Page(Base):
    __tablename__ = "pages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True)

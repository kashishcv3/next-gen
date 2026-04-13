from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class TemplateViewLink(Base):
    __tablename__ = "template_view_link"

    id = Column(Integer, primary_key=True, index=True)
    template = Column(String(255), index=True)
    view = Column(String(255), index=True)
    store = Column(String(255))
    session_vars = Column(Text)
    type = Column(String(50))
    redirect = Column(String(255))
    display_template = Column(String(255))
    permissions = Column(Text)
    admin_permissions = Column(Text)
    meta_robots = Column(String(255))

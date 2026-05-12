"""Auto-generated SQLAlchemy model for `image_resize`.

Mirrors the colorcommerce.image_resize table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class ImageResize(Base):
    __tablename__ = "image_resize"

    site_id = Column("site_id", Integer, primary_key=True)
    popup_x = Column("popup_x", Integer, nullable=True)
    popup_y = Column("popup_y", Integer, nullable=True)
    large_x = Column("large_x", Integer, nullable=True)
    large_y = Column("large_y", Integer, nullable=True)
    thumb_x = Column("thumb_x", Integer, nullable=True)
    thumb_y = Column("thumb_y", Integer, nullable=True)
    image = Column("image", String(255), nullable=True)
    image_subdir = Column("image_subdir", String(255), nullable=True)
    maintain_ratio = Column("maintain_ratio", String(1), nullable=True)
    recipe_cats_x = Column("recipe_cats_x", Integer, nullable=True)
    recipe_cats_y = Column("recipe_cats_y", Integer, nullable=True)

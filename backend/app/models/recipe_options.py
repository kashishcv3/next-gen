"""Auto-generated SQLAlchemy model for `recipe_options`.

Mirrors the colorcommerce.recipe_options table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class RecipeOptions(Base):
    __tablename__ = "recipe_options"

    site_id = Column("site_id", Integer, primary_key=True)
    recipe_rating_usegroups = Column("recipe_rating_usegroups", String(1), nullable=True)
    recipe_rating_add_cg = Column("recipe_rating_add_cg", String(1), nullable=True)
    recipe_rating_cg = Column("recipe_rating_cg", Integer, nullable=True)
    recipe_rating_thanks = Column("recipe_rating_thanks", String(1), nullable=True)
    recipe_rating_email = Column("recipe_rating_email", String(1), nullable=True)
    recipe_rating_subject = Column("recipe_rating_subject", String(100), nullable=True)
    recipe_rating_from = Column("recipe_rating_from", String(100), nullable=True)
    recipe_rating_groups = Column("recipe_rating_groups", String(255), nullable=True)
    recipe_rating_auto = Column("recipe_rating_auto", String(1), nullable=True)
    recipe_request_review = Column("recipe_request_review", String(1), nullable=True)
    recipe_rating_max = Column("recipe_rating_max", Integer, nullable=True)
    recipe_request_review_days = Column("recipe_request_review_days", Integer, nullable=True)
    recipe_request_review_from = Column("recipe_request_review_from", String(255), nullable=True)
    recipe_request_review_subject = Column("recipe_request_review_subject", String(50), nullable=True)
    recipe_rating_notify = Column("recipe_rating_notify", String(1), nullable=True)
    recipe_rating_notify_email = Column("recipe_rating_notify_email", String(100), nullable=True)
    recipe_customer_review_rating = Column("recipe_customer_review_rating", String(1), nullable=True)
    recipe_customer_review_ship_email = Column("recipe_customer_review_ship_email", String(1), nullable=True)
    recipe_review_sort = Column("recipe_review_sort", String(8), nullable=True)
    recipe_request_review_useshipon = Column("recipe_request_review_useshipon", String(1), nullable=True)

"""Auto-generated SQLAlchemy model for `product_options`.

Mirrors the colorcommerce.product_options table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class ProductOptions(Base):
    __tablename__ = "product_options"

    site_id = Column("site_id", Integer, primary_key=True)
    rating_usegroups = Column("rating_usegroups", String(1), nullable=True)
    rating_add_cg = Column("rating_add_cg", String(1), nullable=True)
    rating_cg = Column("rating_cg", Integer, nullable=True)
    rating_thanks = Column("rating_thanks", String(1), nullable=True)
    rating_email = Column("rating_email", String(1), nullable=True)
    rating_subject = Column("rating_subject", String(100), nullable=True)
    rating_from = Column("rating_from", String(100), nullable=True)
    review_keyword_block = Column("review_keyword_block", Text, nullable=True)
    rating_groups = Column("rating_groups", String(255), nullable=True)
    rating_auto = Column("rating_auto", String(1), nullable=True)
    request_review = Column("request_review", String(1), nullable=True)
    rating_max = Column("rating_max", Integer, nullable=True)
    request_review_days = Column("request_review_days", Integer, nullable=True)
    request_review_from = Column("request_review_from", String(255), nullable=True)
    request_review_subject = Column("request_review_subject", String(50), nullable=True)
    rating_notify = Column("rating_notify", String(1), nullable=True)
    rating_notify_email = Column("rating_notify_email", String(100), nullable=True)
    customer_review_rating = Column("customer_review_rating", String(1), nullable=True)
    customer_review_ship_email = Column("customer_review_ship_email", String(1), nullable=True)
    product_review_sort = Column("product_review_sort", String(8), nullable=True)
    inventory_control = Column("inventory_control", String(1), nullable=True)
    verify_inventory = Column("verify_inventory", String(1), nullable=True)
    on_order_override = Column("on_order_override", String(1), nullable=True)
    kit_stock_st = Column("kit_stock_st", String(1), nullable=True)
    inventory_control_notify = Column("inventory_control_notify", String(1), nullable=True)
    inventory_control_notify_email = Column("inventory_control_notify_email", String(100), nullable=True)
    inventory_control_notify_backorder = Column("inventory_control_notify_backorder", String(1), nullable=True)
    product_notify = Column("product_notify", String(1), nullable=True)
    product_notify_subject = Column("product_notify_subject", String(100), nullable=True)
    product_notify_email = Column("product_notify_email", String(100), nullable=True)
    new_product_notify = Column("new_product_notify", String(1), nullable=True)
    new_product_notify_subject = Column("new_product_notify_subject", String(100), nullable=True)
    new_product_notify_email = Column("new_product_notify_email", String(100), nullable=True)
    artifi_enable = Column("artifi_enable", String(1), nullable=True)
    artifi_siteid = Column("artifi_siteid", Text, nullable=True)
    artifi_apikey = Column("artifi_apikey", Text, nullable=True)
    artifi_js = Column("artifi_js", Text, nullable=True)
    request_review_useshipon = Column("request_review_useshipon", String(1), nullable=True)
    attribute_discount_override = Column("attribute_discount_override", String(1), nullable=True)
    duplicate_skus = Column("duplicate_skus", String(1), nullable=True)
    refined_search_single = Column("refined_search_single", String(1), nullable=True)
    review_honor_opt_out = Column("review_honor_opt_out", String(1), nullable=True)
    always_check_cart_inventory = Column("always_check_cart_inventory", String(1), nullable=True)
    consider_kit_parent = Column("consider_kit_parent", String(1), nullable=True)

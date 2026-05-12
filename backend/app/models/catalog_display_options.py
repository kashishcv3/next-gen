"""Auto-generated SQLAlchemy model for `catalog_display_options`.

Mirrors the colorcommerce.catalog_display_options table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String
from app.database import Base


class CatalogDisplayOptions(Base):
    __tablename__ = "catalog_display_options"

    site_id = Column("site_id", Integer, primary_key=True)
    category_not_found = Column("category_not_found", String(1), nullable=True)
    recently_viewed_sort = Column("recently_viewed_sort", String(6), nullable=True)
    new_products_days = Column("new_products_days", Integer, nullable=True)
    max_comparable = Column("max_comparable", Integer, nullable=True)
    express_order_hidden = Column("express_order_hidden", String(1), nullable=True)
    hidden_prods_display = Column("hidden_prods_display", String(1), nullable=True)
    prod_display_type = Column("prod_display_type", String(16), nullable=True)
    category_sort = Column("category_sort", String(17), nullable=True)
    category_sort_user_defined = Column("category_sort_user_defined", String(8), nullable=True)
    best_seller_days = Column("best_seller_days", Integer, nullable=True)
    sub_category_display = Column("sub_category_display", String(1), nullable=True)
    category_global_filters = Column("category_global_filters", String(1), nullable=True)
    redirect_type_cat = Column("redirect_type_cat", String(255), nullable=True)
    redirect_detail_cat = Column("redirect_detail_cat", String(255), nullable=True)
    outofstock_bottom_category = Column("outofstock_bottom_category", String(1), nullable=True)
    subproduct_sort = Column("subproduct_sort", String(9), nullable=True)
    attribute_sort = Column("attribute_sort", String(9), nullable=True)
    prod_cat_display = Column("prod_cat_display", String(1), nullable=True)
    interactive_pricing = Column("interactive_pricing", String(1), nullable=True)
    redirect_type_prod = Column("redirect_type_prod", String(255), nullable=True)
    redirect_detail_prod = Column("redirect_detail_prod", String(255), nullable=True)
    url_split_char = Column("url_split_char", String(1), nullable=True)
    prod_details_on_category = Column("prod_details_on_category", String(1), nullable=True)
    qty_discount_round = Column("qty_discount_round", String(8), nullable=True)
    display_oos_attributes = Column("display_oos_attributes", String(1), nullable=False)
    include_cat_prod_links = Column("include_cat_prod_links", String(1), nullable=True)

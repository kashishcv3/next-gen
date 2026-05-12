"""Auto-generated SQLAlchemy model for `tax_rate_tool`.

Mirrors the colorcommerce.tax_rate_tool table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class TaxRateTool(Base):
    __tablename__ = "tax_rate_tool"

    site_id = Column("site_id", Integer, primary_key=True)
    tax_api_calc = Column("tax_api_calc", String(1), nullable=True)
    tax_url = Column("tax_url", String(255), nullable=True)
    exactor_rate_calc = Column("exactor_rate_calc", String(3), nullable=True)
    exactor_cv3 = Column("exactor_cv3", String(1), nullable=True)
    exactor_send_skus = Column("exactor_send_skus", String(1), nullable=True)
    exactor_send_shipping = Column("exactor_send_shipping", String(1), nullable=True)
    exactor_merchant_id = Column("exactor_merchant_id", String(20), nullable=True)
    exactor_user_id = Column("exactor_user_id", String(20), nullable=True)
    exactor_from_name = Column("exactor_from_name", String(255), nullable=True)
    exactor_from_address = Column("exactor_from_address", String(255), nullable=True)
    exactor_from_city = Column("exactor_from_city", String(100), nullable=True)
    exactor_from_state = Column("exactor_from_state", String(100), nullable=True)
    exactor_from_zip = Column("exactor_from_zip", String(50), nullable=True)
    exactor_from_country = Column("exactor_from_country", String(100), nullable=True)
    exactor_states = Column("exactor_states", Text, nullable=True)
    exactor_tax_states_alt = Column("exactor_tax_states_alt", String(1), nullable=True)
    exactor_send_exemption = Column("exactor_send_exemption", String(1), nullable=True)
    avatax_rate_calc = Column("avatax_rate_calc", String(1), nullable=True)
    avatax_account = Column("avatax_account", String(20), nullable=True)
    avatax_license = Column("avatax_license", String(20), nullable=True)
    avatax_company_code = Column("avatax_company_code", String(25), nullable=True)
    avatax_customer_code = Column("avatax_customer_code", String(20), nullable=True)
    avatax_connection_type = Column("avatax_connection_type", String(14), nullable=True)
    avatax_from_address = Column("avatax_from_address", String(255), nullable=True)
    avatax_from_city = Column("avatax_from_city", String(100), nullable=True)
    avatax_from_state = Column("avatax_from_state", String(100), nullable=True)
    avatax_from_zip = Column("avatax_from_zip", String(50), nullable=True)
    avatax_states = Column("avatax_states", String(150), nullable=True)
    avatax_tax_states_alt = Column("avatax_tax_states_alt", String(1), nullable=True)
    avatax_send_product = Column("avatax_send_product", String(1), nullable=True)
    cch_rate_calc = Column("cch_rate_calc", String(1), nullable=True)
    cch_company_id = Column("cch_company_id", String(50), nullable=True)
    cch_user = Column("cch_user", String(50), nullable=True)
    cch_pass = Column("cch_pass", String(50), nullable=True)
    cch_address1 = Column("cch_address1", String(255), nullable=True)
    cch_address2 = Column("cch_address2", String(255), nullable=True)
    cch_states = Column("cch_states", String(150), nullable=True)
    cch_tax_states_alt = Column("cch_tax_states_alt", String(1), nullable=True)
    cch_product_code = Column("cch_product_code", String(25), nullable=True)
    cch_post_invoice = Column("cch_post_invoice", String(1), nullable=True)
    tax_api_version = Column("tax_api_version", String(1), nullable=True)
    tax_api_auth = Column("tax_api_auth", String(1), nullable=True)
    tax_api_username = Column("tax_api_username", String(20), nullable=True)
    tax_api_password = Column("tax_api_password", String(255), nullable=True)
    tax_api_key = Column("tax_api_key", String(40), nullable=True)
    avatax_shipping_sku = Column("avatax_shipping_sku", String(20), nullable=True)
    avatax_environ = Column("avatax_environ", String(10), nullable=True)
    tax_app_store_calc = Column("tax_app_store_calc", String(1), nullable=True)
    tax_app_store_config_id = Column("tax_app_store_config_id", Integer, nullable=True)
    tax_app_store_conf = Column("tax_app_store_conf", Text, nullable=True)

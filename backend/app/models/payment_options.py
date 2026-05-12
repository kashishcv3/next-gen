"""Auto-generated SQLAlchemy model for `payment_options`.

Mirrors the colorcommerce.payment_options table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class PaymentOptions(Base):
    __tablename__ = "payment_options"

    site_id = Column("site_id", Integer, primary_key=True)
    payment_methods = Column("payment_methods", String(255), nullable=True)
    payment_members_only = Column("payment_members_only", String(1), nullable=True)
    echeck = Column("echeck", String(1), nullable=True)
    echeck_user = Column("echeck_user", String(255), nullable=True)
    echeck_trans_key = Column("echeck_trans_key", String(255), nullable=True)
    credit_cards = Column("credit_cards", String(255), nullable=True)
    private_label_name = Column("private_label_name", String(100), nullable=True)
    private_label_validation = Column("private_label_validation", String(8), nullable=True)
    display_cvv2 = Column("display_cvv2", String(1), nullable=True)
    hide_cc_list = Column("hide_cc_list", String(1), nullable=True)
    payment_gateway_unavailable = Column("payment_gateway_unavailable", String(1), nullable=True)
    enable_firstdata_compass = Column("enable_firstdata_compass", String(1), nullable=True)
    authorize_cim = Column("authorize_cim", String(1), nullable=False)
    authorize_cim_env = Column("authorize_cim_env", String(1), nullable=True)
    firstdata_authorize = Column("firstdata_authorize", String(1), nullable=True)
    payment_app_store_use = Column("payment_app_store_use", String(1), nullable=True)
    payment_app_store_config_id = Column("payment_app_store_config_id", Integer, nullable=True)
    payment_app_store_config = Column("payment_app_store_config", Text, nullable=True)
    paypal_redirect_to_ppx = Column("paypal_redirect_to_ppx", String(1), nullable=True)
    payment_app_store_save__disabled = Column("payment_app_store_save__disabled", String(1), nullable=True)
    payment_app_store_save_disabled = Column("payment_app_store_save_disabled", Integer, nullable=True)
    gpay_psp_settings = Column("gpay_psp_settings", Text, nullable=True)
    enable_google_pay = Column("enable_google_pay", String(1), nullable=True)
    enable_apple_pay = Column("enable_apple_pay", String(1), nullable=True)
    apple_psp_settings = Column("apple_psp_settings", Text, nullable=True)

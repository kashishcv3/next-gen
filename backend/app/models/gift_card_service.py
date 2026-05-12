"""Auto-generated SQLAlchemy model for `gift_card_service`.

Mirrors the colorcommerce.gift_card_service table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Date, Integer, String, Text
from app.database import Base


class GiftCardService(Base):
    __tablename__ = "gift_card_service"

    site_id = Column("site_id", Integer, primary_key=True)
    giftcertws_api = Column("giftcertws_api", String(1), nullable=True)
    giftcertws_url = Column("giftcertws_url", String(255), nullable=True)
    gift_certificate_processor = Column("gift_certificate_processor", String(1), nullable=True)
    st_gift_certificate_create = Column("st_gift_certificate_create", String(1), nullable=True)
    gift_certificate_merchant = Column("gift_certificate_merchant", String(255), nullable=True)
    gift_certificate_terminal = Column("gift_certificate_terminal", String(255), nullable=True)
    gcv_processor = Column("gcv_processor", String(1), nullable=True)
    gcv_terminal = Column("gcv_terminal", String(25), nullable=True)
    gcv_server = Column("gcv_server", String(10), nullable=True)
    arroweye_gift_certificates = Column("arroweye_gift_certificates", String(1), nullable=True)
    arroweye_greet_card = Column("arroweye_greet_card", Integer, nullable=True)
    arroweye_gift_card = Column("arroweye_gift_card", Integer, nullable=True)
    gcwtg_processor = Column("gcwtg_processor", String(1), nullable=True)
    gcwtg_merchant = Column("gcwtg_merchant", String(40), nullable=True)
    gcwtg_user = Column("gcwtg_user", String(40), nullable=True)
    gcwtg_pw = Column("gcwtg_pw", String(40), nullable=True)
    gcwtg_product_certs = Column("gcwtg_product_certs", String(1), nullable=True)
    gcwtg_require_pin = Column("gcwtg_require_pin", String(1), nullable=True)
    gcaloha_processor = Column("gcaloha_processor", String(1), nullable=True)
    gcaloha_wsuser = Column("gcaloha_wsuser", String(40), nullable=True)
    gcaloha_wspw = Column("gcaloha_wspw", String(40), nullable=True)
    gcaloha_user = Column("gcaloha_user", String(40), nullable=True)
    gcaloha_pw = Column("gcaloha_pw", String(40), nullable=True)
    gcaloha_compid = Column("gcaloha_compid", String(40), nullable=True)
    gcaloha_pinverify = Column("gcaloha_pinverify", String(1), nullable=True)
    elavon_processor = Column("elavon_processor", String(1), nullable=True)
    elavon_environment = Column("elavon_environment", String(10), nullable=True)
    elavon_reg_key = Column("elavon_reg_key", String(50), nullable=True)
    elavon_vendor = Column("elavon_vendor", String(2), nullable=True)
    elavon_terminal = Column("elavon_terminal", String(50), nullable=True)
    elavon_bank_num = Column("elavon_bank_num", String(6), nullable=True)
    elavon_record_nbr = Column("elavon_record_nbr", String(5), nullable=True)
    elavon_record_date = Column("elavon_record_date", Date, nullable=True)
    tc_gift_certificate_processor = Column("tc_gift_certificate_processor", String(1), nullable=True)
    tc_gift_certificate_auth = Column("tc_gift_certificate_auth", Text, nullable=True)
    gcv_version = Column("gcv_version", String(7), nullable=True)
    gcv_clientkey = Column("gcv_clientkey", String(40), nullable=True)
    giftcertws_apiversion = Column("giftcertws_apiversion", String(1), nullable=True)
    giftcertws_secure = Column("giftcertws_secure", String(1), nullable=True)
    giftcertws_username = Column("giftcertws_username", String(20), nullable=True)
    giftcertws_password = Column("giftcertws_password", String(255), nullable=True)
    giftcertws_signkey = Column("giftcertws_signkey", String(40), nullable=True)
    giftcertws_require_pin = Column("giftcertws_require_pin", String(1), nullable=True)
    gcv_create = Column("gcv_create", String(1), nullable=True)
    gcv_program = Column("gcv_program", String(34), nullable=True)
    gcv_terminal_create = Column("gcv_terminal_create", String(25), nullable=True)

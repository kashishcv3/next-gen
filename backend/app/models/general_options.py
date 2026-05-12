"""Auto-generated SQLAlchemy model for `general_options`.

Mirrors the colorcommerce.general_options table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, Float, Integer, String, Text
from app.database import Base


class GeneralOptions(Base):
    __tablename__ = "general_options"

    site_id = Column("site_id", Integer, primary_key=True)
    admin_search_boxes = Column("admin_search_boxes", String(1), nullable=True)
    admin_append_name = Column("admin_append_name", String(1), nullable=True)
    batch_size = Column("batch_size", String(3), nullable=True)
    editor_type = Column("editor_type", String(1), nullable=True)
    gc_maxlifetime = Column("gc_maxlifetime", String(7), nullable=True)
    create_session_link = Column("create_session_link", String(1), nullable=True)
    captcha_forms = Column("captcha_forms", Text, nullable=True)
    captcha_method = Column("captcha_method", String(1), nullable=True)
    recaptcha_site_key = Column("recaptcha_site_key", String(100), nullable=True)
    recaptcha_secret_key = Column("recaptcha_secret_key", String(100), nullable=True)
    recaptcha_score = Column("recaptcha_score", Float, nullable=True)
    secure_logins = Column("secure_logins", String(1), nullable=True)
    iframe_allow = Column("iframe_allow", String(1), nullable=True)
    template_css_enabled = Column("template_css_enabled", String(1), nullable=True)
    csrf_actions = Column("csrf_actions", Text, nullable=True)
    email_valid_retries = Column("email_valid_retries", Integer, nullable=True)
    email_valid_error_message = Column("email_valid_error_message", String(255), nullable=True)
    email_validation_pages = Column("email_validation_pages", Text, nullable=True)
    email_valid_api_key_general = Column("email_valid_api_key_general", String(255), nullable=True)
    consider_invalid_status = Column("consider_invalid_status", Text, nullable=True)
    whitelisted_emails = Column("whitelisted_emails", Text, nullable=True)

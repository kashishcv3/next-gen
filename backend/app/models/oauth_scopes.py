"""Auto-generated SQLAlchemy model for `oauth_scopes`.

Mirrors the colorcommerce.oauth_scopes table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Boolean, Column, String
from app.database import Base


class OauthScopes(Base):
    __tablename__ = "oauth_scopes"

    scope = Column("scope", String(80), primary_key=True)
    is_default = Column("is_default", Boolean, nullable=True)

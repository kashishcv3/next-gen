"""Auto-generated SQLAlchemy model for `oauth_access_tokens`.

Mirrors the colorcommerce.oauth_access_tokens table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, DateTime, String
from app.database import Base


class OauthAccessTokens(Base):
    __tablename__ = "oauth_access_tokens"

    access_token = Column("access_token", String(40), primary_key=True)
    client_id = Column("client_id", String(80), nullable=False)
    user_id = Column("user_id", String(80), nullable=True)
    expires = Column("expires", DateTime, nullable=False)
    scope = Column("scope", String(4000), nullable=True)

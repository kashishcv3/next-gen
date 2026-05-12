"""Auto-generated SQLAlchemy model for `oauth_clients`.

Mirrors the colorcommerce.oauth_clients table. Edit with care — re-running the
generator may overwrite changes.
"""
from sqlalchemy import Column, String
from app.database import Base


class OauthClients(Base):
    __tablename__ = "oauth_clients"

    client_id = Column("client_id", String(80), primary_key=True)
    client_secret = Column("client_secret", String(80), nullable=True)
    redirect_uri = Column("redirect_uri", String(2000), nullable=True)
    grant_types = Column("grant_types", String(80), nullable=True)
    scope = Column("scope", String(4000), nullable=True)
    user_id = Column("user_id", String(80), nullable=True)

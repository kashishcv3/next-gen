from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://claude_cc:claude_cc_readonly@localhost:3306/colorcommerce"
    SECRET_KEY: str = "cv3-nextgen-secret-2026"
    API_PREFIX: str = "/api/v1"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:3001"]

    # Email / Netcore configuration
    DEFAULT_MAIL_VENDOR: str = "netcore"
    NETCORE_API_KEY: str = "e4a3158279494647bc2112e6bf11ea9f"
    NETCORE_API_URL: str = "https://emailapi.netcorecloud.net/v6/mail/send"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

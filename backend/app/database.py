from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    connect_args={"charset": "utf8mb4"},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
# Per-store database connections
# Each store has its own database named cart_{folder_name}
# where folder_name comes from sites.config_file (minus '_config.php')
# =====================================================

# Cache of per-store engines keyed by database name
_store_engines = {}

STORE_DB_USER = "claude_cm"
STORE_DB_PASS = "claude_cm_readonly"
STORE_DB_HOST = "localhost"
STORE_DB_PORT = 3306


def get_store_db_name(site_id: int, central_db) -> str:
    """
    Get the per-store database name for a given site_id.
    Looks up config_file in sites table and derives: cart_{folder_name}
    """
    row = central_db.execute(
        text("SELECT config_file, name FROM sites WHERE id = :site_id"),
        {"site_id": site_id}
    ).first()

    if not row:
        return None

    # config_file is like 'ministeam_config.php' -> folder_name = 'ministeam'
    if row.config_file and '_config.php' in row.config_file:
        folder_name = row.config_file.replace('_config.php', '')
    else:
        # Fallback: use store name, lowercase, alphanumeric only
        folder_name = ''.join(c for c in (row.name or '').lower() if c.isalnum())

    return f"cart_{folder_name}"


def get_store_engine(db_name: str):
    """Get or create a SQLAlchemy engine for a per-store database."""
    if db_name not in _store_engines:
        url = f"mysql+pymysql://{STORE_DB_USER}:{STORE_DB_PASS}@{STORE_DB_HOST}:{STORE_DB_PORT}/{db_name}"
        _store_engines[db_name] = create_engine(
            url,
            echo=False,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            connect_args={"charset": "utf8mb4"},
        )
    return _store_engines[db_name]


def get_store_session(db_name: str):
    """Create a new session for a per-store database."""
    engine = get_store_engine(db_name)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return Session()

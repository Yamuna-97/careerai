"""
alembic/env.py
───────────────
Alembic migration environment configuration.
Reads the database URL from .env via the app's settings.
"""

import os
import sys
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# ── Make sure "backend/" is in the Python path ────────────────────────────────
# This lets us import from "app.*" in migrations
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Import our app settings and all models so Alembic can detect changes
from app.core.config import settings
from app.core.database import Base
import app.models  # noqa: F401 — triggers all model imports

# ── Alembic Config ────────────────────────────────────────────────────────────
config = context.config

# Override the SQLAlchemy URL from our .env settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Set up logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# This is what Alembic compares against to generate migration diffs
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode — generates SQL without a live connection.
    Useful for reviewing SQL before applying it.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode — connects directly to the database.
    This is what you use with: alembic upgrade head
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

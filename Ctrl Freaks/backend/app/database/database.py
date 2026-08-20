from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

import os
from pathlib import Path


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

env_path = Path(__file__).resolve().parents[2] / ".env"

print("ENV PATH:", env_path)
print("ENV EXISTS:", env_path.exists())

load_dotenv(
    dotenv_path=env_path,
    override=True
)


# =========================================================
# DATABASE URL
# =========================================================

DATABASE_URL = os.getenv("DATABASE_URL")

print("DATABASE_URL =", DATABASE_URL)

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured in .env"
    )


# =========================================================
# DATABASE ENGINE
# =========================================================
#
# Supabase Session Pooler has a limited number of
# backend connections.
#
# Keep SQLAlchemy's local pool small so RapidRed
# does not consume all available Supabase connections.
#
# pool_size      = maximum persistent connections
# max_overflow   = additional temporary connections
# pool_timeout   = wait time before failing
# pool_recycle   = recycle old connections
#
# =========================================================

engine = create_engine(
    DATABASE_URL,

    pool_pre_ping=True,

    pool_size=3,

    max_overflow=2,

    pool_timeout=30,

    pool_recycle=1800,

    pool_use_lifo=True
)


# =========================================================
# SESSION
# =========================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# =========================================================
# BASE MODEL
# =========================================================

Base = declarative_base()


# =========================================================
# DATABASE DEPENDENCY
# =========================================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    except Exception:

        # Roll back any unfinished transaction
        # before returning the connection to the pool.

        db.rollback()

        raise

    finally:

        # Always release the connection.

        db.close()
from contextlib import contextmanager
from sqlalchemy.orm import DeclarativeBase, sessionmaker, scoped_session, Session
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from typing import Generator
from config import get_database_uri

engine = None
SessionLocal = None
current_uri: str | None = None


class Base(DeclarativeBase):
    pass


def configure_engine() -> None:
    global engine, SessionLocal, current_uri
    uri = get_database_uri()
    if engine is not None and current_uri == uri and SessionLocal is not None:
        return

    if engine is not None:
        engine.dispose()

    engine_args = {
        "echo": False,
        "future": True,
        "pool_pre_ping": True,
    }

    if uri.startswith("sqlite"):
        engine_args["connect_args"] = {"check_same_thread": False}
        if ":memory:" in uri:
            engine_args["poolclass"] = StaticPool

    new_engine = create_engine(
        uri,
        **engine_args,
    )
    SessionLocal = scoped_session(
        sessionmaker(
            bind=new_engine,
            autoflush=False,
            autocommit=False,
            expire_on_commit=False
        )
    )
    engine = new_engine
    current_uri = uri


@contextmanager
def get_db_session() -> Generator[Session, None, None]:
    if SessionLocal is None:
        configure_engine()
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def create_all() -> None:
    if engine is None:
        configure_engine()
    Base.metadata.create_all(bind=engine)


configure_engine()

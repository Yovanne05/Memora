import config
import pytest
from sqlalchemy import create_engine
from flask import g
from utils import db as db_utils


def _clear_scope_cache():
    """Nettoie le cache des scopes d'accès"""
    g.pop("accessible_collection_ids", None)
    g.pop("accessible_note_ids", None)


@pytest.fixture(autouse=True)
def configure_test_env(monkeypatch):
    """Configure l'environnement de test avec SQLite en mémoire pour tous les tests"""
    old_engine = db_utils.engine
    test_uri = "sqlite+pysqlite:///:memory:"
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("SWAGGER_ENABLED", "0")
    monkeypatch.setenv("SQLALCHEMY_TEST_DATABASE_URI", test_uri)
    monkeypatch.setattr(config, "APP_ENV", "test")
    monkeypatch.setattr(config, "SWAGGER_ENABLED", False)
    monkeypatch.setattr(config, "SQLALCHEMY_TEST_DATABASE_URI", test_uri)
    db_utils.SessionLocal.remove()

    test_engine = create_engine(
        test_uri,
        echo=False,
        future=True,
        pool_pre_ping=True,
    )
    monkeypatch.setattr(db_utils, "engine", test_engine)
    db_utils.SessionLocal.configure(bind=test_engine)

    with test_engine.begin():
        db_utils.Base.metadata.drop_all(bind=test_engine)
        db_utils.Base.metadata.create_all(bind=test_engine)

    try:
        yield
    finally:
        db_utils.SessionLocal.remove()
        db_utils.SessionLocal.configure(bind=old_engine)
        test_engine.dispose()


@pytest.fixture(autouse=True)
def app_context(configure_test_env):
    """Fournit un contexte d'application Flask pour tous les tests"""
    from app import create_app
    app = create_app()
    with app.app_context():
        db_utils.drop_all()
        db_utils.create_all()
        _clear_scope_cache()
        yield
        _clear_scope_cache()

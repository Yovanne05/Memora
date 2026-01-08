"""
Configuration racine des tests.

Architecture optimisée:
- Moteur SQLAlchemy session-scoped (créé une seule fois)
- Transaction rollback par test (isolation sans DROP/CREATE)
- Insertion directe en DB via TestDataFactory
"""
from uuid import uuid4

import bcrypt
import config
import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session
from flask import g

from utils import db as db_utils
from utils.enums import RoleEnum, VisibilityEnum
from daos.user_dao import User
from daos.collection_dao import Collection, CollectionShare
from daos.note_dao import Note, NoteShare
from daos.flashcard_dao import Flashcard
from daos.flashcard_answer_dao import FlashcardAnswer
from daos.review_dao import Review
from daos.report_dao import Report
from daos.favorite_dao import NoteFavorite, CollectionFavorite
from daos.note_image_dao import NoteImage
from daos.note_share_link_dao import NoteShareLink
from daos.collection_share_link_dao import CollectionShareLink
from repositorys import user_repository, collection_repository, note_repository


def _clear_scope_cache():
    """Nettoie le cache des scopes d'accès."""
    g.pop("accessible_collection_ids", None)
    g.pop("accessible_note_ids", None)


@pytest.fixture(scope="session")
def db_engine():
    """Crée le moteur SQLAlchemy une seule fois pour toute la session."""
    test_uri = "sqlite+pysqlite:///:memory:"

    engine = create_engine(
        test_uri,
        echo=False,
        future=True,
        pool_pre_ping=True,
        connect_args={"check_same_thread": False},
    )

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    db_utils.Base.metadata.create_all(bind=engine)
    yield engine

    db_utils.Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture(scope="session", autouse=True)
def configure_test_env_session(db_engine):
    """Configure l'environnement de test au niveau session."""
    import os
    old_env = os.environ.copy()
    os.environ["APP_ENV"] = "test"
    os.environ["SWAGGER_ENABLED"] = "0"

    old_app_env = config.APP_ENV
    old_swagger = config.SWAGGER_ENABLED
    config.APP_ENV = "test"
    config.SWAGGER_ENABLED = False

    old_engine = db_utils.engine
    db_utils.SessionLocal.configure(bind=db_engine)
    db_utils.engine = db_engine

    yield

    os.environ.clear()
    os.environ.update(old_env)
    config.APP_ENV = old_app_env
    config.SWAGGER_ENABLED = old_swagger
    db_utils.engine = old_engine


@pytest.fixture(autouse=True)
def db_session(db_engine):
    """Crée une transaction par test qui sera rollback à la fin."""
    connection = db_engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)

    old_session_factory = db_utils.SessionLocal.registry()
    db_utils.SessionLocal.registry.clear()
    db_utils.SessionLocal.configure(bind=connection)

    yield session

    if transaction.is_active:
        transaction.rollback()
    session.close()
    connection.close()

    db_utils.SessionLocal.registry.clear()
    db_utils.SessionLocal.configure(bind=db_engine)


@pytest.fixture(autouse=True)
def app_context(db_session):
    """Fournit un contexte d'application Flask pour tous les tests."""
    from app import create_app
    app = create_app()

    with app.app_context():
        _clear_scope_cache()
        yield
        _clear_scope_cache()


@pytest.fixture
def app_client():
    """Client de test Flask."""
    from app import create_app
    app = create_app()

    with app.test_client() as client:
        client.environ_base["REMOTE_ADDR"] = f"10.0.0.{int(uuid4().int % 200) + 1}"
        yield client


class TestDataFactory:
    """Factory pour créer des données de test directement en base de données."""

    def __init__(self, client):
        self.client = client
        self.owner_id = None
        self.collection_id = None
        self.note_id = None
        self._owner_password = None
        self.base_slug = uuid4().hex[:8]

    def create_user(self, label: str = None, role: RoleEnum = RoleEnum.CLIENT) -> str:
        """Crée un utilisateur en base de données."""
        if label is None:
            label = self.base_slug

        email = f"user-{label}@example.com"
        password = f"TestPwd-{label}-1!"  # NOSONAR

        user = User(
            id=str(uuid4()),
            email=email,
            password_hash=bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),  # NOSONAR
            username=f"user-{label}",
            display_name=f"User {label}",
            role=role,
        )

        created_user = user_repository.add(user)

        if self.owner_id is None:
            self.owner_id = created_user.id
            self._owner_password = password

        return created_user.id

    def authenticate_as(self, user_id: str, password: str = None) -> None:
        """Authentifie le client HTTP avec un utilisateur."""
        if password is None:
            password = self._owner_password

        response = self.client.post(
            "/sessions",
            json={
                "identifier": f"user-{self.base_slug}@example.com" if user_id == self.owner_id else f"user-other@example.com",
                "password": password,  # NOSONAR
            },
        )
        assert response.status_code == 200, response.get_data(as_text=True)
        token = response.get_json()["access_token"]
        self.client.environ_base["HTTP_AUTHORIZATION"] = f"Bearer {token}"

    def create_collection(
        self,
        owner_id: str = None,
        name: str = None,
        visibility: VisibilityEnum = VisibilityEnum.PRIVATE
    ) -> str:
        """Crée une collection en base de données."""
        if owner_id is None:
            owner_id = self.owner_id

        collection = Collection(
            id=str(uuid4()),
            name=name or f"Collection {self.base_slug}-{uuid4().hex[:4]}",
            description="Test collection",
            owner_id=owner_id,
            visibility=visibility,
        )

        created_collection = collection_repository.add(collection)

        if self.collection_id is None:
            self.collection_id = created_collection.id

        return created_collection.id

    def create_note(
        self,
        title: str = None,
        content: str = "Test content",
        collection_id: str = None,
        owner_id: str = None,
        visibility: VisibilityEnum = VisibilityEnum.PRIVATE
    ) -> str:
        """Crée une note en base de données."""
        if owner_id is None:
            owner_id = self.owner_id
        if collection_id is None:
            collection_id = self.collection_id

        note = Note(
            id=str(uuid4()),
            title=title or f"Note {self.base_slug}-{uuid4().hex[:4]}",
            content=content,
            owner_id=owner_id,
            collection_id=collection_id,
            visibility=visibility,
        )

        created_note = note_repository.add(note)

        if self.note_id is None:
            self.note_id = created_note.id

        return created_note.id

    def bootstrap(self) -> None:
        """Setup rapide: crée user + collection + note et authentifie."""
        self.owner_id = self.create_user()
        self.collection_id = self.create_collection()
        self.note_id = self.create_note()
        self.authenticate_as(self.owner_id)


@pytest.fixture
def test_factory(app_client):
    """
    Factory pour créer des données de test.

    Usage:
        def test_example(test_factory):
            user_id = test_factory.create_user()
            collection_id = test_factory.create_collection(owner_id=user_id)
    """
    return TestDataFactory(client=app_client)


@pytest.fixture
def note_test_data(app_client):
    """Fixture avec setup complet (user, collection, note)."""
    factory = TestDataFactory(client=app_client)
    factory.bootstrap()
    return factory


@pytest.fixture
def client_with_note_data(note_test_data):
    """Retourne (client, data) pour compatibilité."""
    return note_test_data.client, note_test_data

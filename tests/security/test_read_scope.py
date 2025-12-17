import os
from uuid import uuid4

os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("SWAGGER_ENABLED", "0")

import config
import pytest
from flask import g
from sqlalchemy import create_engine

from app import create_app
from daos.user_dao import User
from dtos.collection_dto import CollectionCreateDTO
from dtos.note_dto import NoteCreateDTO
from repositorys import user_repository
from repositorys.collection_repository import (
    CollectionSearchParams,
    get_for_user as collection_get_for_user,
    list_for_user as collection_list_for_user,
)
from repositorys.note_repository import (
    NoteSearchParams,
    get_for_user as note_get_for_user,
    list_for_user as note_list_for_user,
)
from services.impl.collection.collection_service_impl import collection_service
from services.impl.note.note_crud_service_impl import note_crud_service
from utils import db as db_utils
from utils.enums import RoleEnum, VisibilityEnum


def _clear_scope_cache():
    g.pop("accessible_collection_ids", None)
    g.pop("accessible_note_ids", None)


@pytest.fixture(autouse=True)
def configure_test_env(monkeypatch):
    monkeypatch.setattr(config, "APP_ENV", "test")
    monkeypatch.setattr(config, "SWAGGER_ENABLED", False)
    test_uri = "sqlite+pysqlite:///:memory:"
    monkeypatch.setattr(config, "SQLALCHEMY_TEST_DATABASE_URI", test_uri)
    # Ensure previous scoped sessions are cleared before rebinding.
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
        test_engine.dispose()


@pytest.fixture(autouse=True)
def app_context(configure_test_env):
    app = create_app()
    with app.app_context():
        db_utils.drop_all()
        db_utils.create_all()
        _clear_scope_cache()
        yield
        _clear_scope_cache()


def _create_user(email_prefix: str) -> User:
    unique = uuid4().hex[:8]
    user = User(
        email=f"{email_prefix}-{unique}@example.com",
        username=f"{email_prefix}-{unique}",
        display_name=f"{email_prefix} user",
        password_hash="test-hash",
        role=RoleEnum.CLIENT,
    )
    return user_repository.add(user)


def _bootstrap_data():
    owner = _create_user("owner")
    other = _create_user("other")

    collection_dto = CollectionCreateDTO(
        name=f"Scoped Collection {uuid4().hex[:6]}",
        description="Owned by owner user",
        owner_id=owner.id,
        visibility=VisibilityEnum.PRIVATE,
    )
    created_collection = collection_service.create(collection_dto)

    note_dto = NoteCreateDTO(
        title=f"Scoped Note {uuid4().hex[:6]}",
        content="Private content",
        owner_id=owner.id,
        collection_id=created_collection.id,
        visibility=VisibilityEnum.PRIVATE,
    )
    created_note = note_crud_service.create(note_dto)

    return owner, other, created_collection, created_note


def test_collection_read_scope_blocks_other_users():
    owner, other, created_collection, _ = _bootstrap_data()

    items, total = collection_list_for_user(
        other, CollectionSearchParams()
    )
    assert total == 0
    assert all(item.owner_id == other.id for item in items)

    assert collection_get_for_user(other, created_collection.id) is None

    _clear_scope_cache()

    owner_items, owner_total = collection_list_for_user(
        owner, CollectionSearchParams()
    )
    assert owner_total == 1
    assert {item.id for item in owner_items} == {created_collection.id}


def test_note_read_scope_blocks_other_users():
    owner, other, _, created_note = _bootstrap_data()

    items, total = note_list_for_user(other, NoteSearchParams())
    assert total == 0
    assert all(item.owner_id == other.id for item in items)

    assert note_get_for_user(other, created_note.id) is None

    _clear_scope_cache()

    owner_items, owner_total = note_list_for_user(owner, NoteSearchParams())
    assert owner_total == 1
    assert {item.id for item in owner_items} == {created_note.id}

from uuid import uuid4

import bcrypt
import pytest
from flask import g

from daos.user_dao import User
from dtos.collection_dto import CollectionCreateDTO
from dtos.note_dto import NoteCreateDTO
from repositorys import user_repository, note_share_repository, collection_share_repository
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
from utils.enums import RoleEnum, VisibilityEnum, SharePermissionEnum
from daos.note_dao import NoteShare
from daos.collection_dao import CollectionShare


def _clear_scope_cache():
    """Nettoie le cache des scopes d'accès"""
    g.pop("accessible_collection_ids", None)
    g.pop("accessible_note_ids", None)


def _create_user(email_prefix: str) -> User:
    unique = uuid4().hex[:8]
    password = f"TestPassword-{unique}-1!"  # NOSONAR
    user = User(
        email=f"{email_prefix}-{unique}@example.com",
        username=f"{email_prefix}-{unique}",
        display_name=f"{email_prefix} user",
        password_hash=bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),  # NOSONAR
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


def _share_note(note_id: str, user_id: str, permission: SharePermissionEnum = SharePermissionEnum.READ):
    note_share_repository.add(
        NoteShare(note_id=note_id, user_id=user_id, permission=permission)
    )


def _share_collection(collection_id: str, user_id: str, permission: SharePermissionEnum = SharePermissionEnum.READ):
    collection_share_repository.add(
        CollectionShare(collection_id=collection_id, user_id=user_id, permission=permission)
    )


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


def test_collection_read_scope_allows_shared_collection():
    owner, other, created_collection, _ = _bootstrap_data()
    _share_collection(created_collection.id, other.id)
    _clear_scope_cache()

    items, total = collection_list_for_user(
        other, CollectionSearchParams()
    )
    assert total == 1
    assert {item.id for item in items} == {created_collection.id}


def test_collection_read_scope_allows_public_collection():
    owner, other = _create_user("owner-pub-collection"), _create_user("other-pub-collection")
    public_collection = collection_service.create(
        CollectionCreateDTO(
            name=f"Public Collection {uuid4().hex[:6]}",
            description="Public collection",
            owner_id=owner.id,
            visibility=VisibilityEnum.PUBLIC,
        )
    )
    _clear_scope_cache()

    items, total = collection_list_for_user(other, CollectionSearchParams())
    assert total == 1
    assert {item.id for item in items} == {public_collection.id}


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


def test_note_read_scope_allows_shared_note():
    owner, other, _, created_note = _bootstrap_data()
    _share_note(created_note.id, other.id)
    _clear_scope_cache()

    items, total = note_list_for_user(other, NoteSearchParams())
    assert total == 1
    assert {item.id for item in items} == {created_note.id}


def test_note_read_scope_allows_public_note():
    owner, other = _create_user("owner-public"), _create_user("other-public")
    collection_dto = CollectionCreateDTO(
        name=f"Public Collection {uuid4().hex[:6]}",
        description="Public collection",
        owner_id=owner.id,
        visibility=VisibilityEnum.PUBLIC,
    )
    created_collection = collection_service.create(collection_dto)

    public_note = note_crud_service.create(
        NoteCreateDTO(
            title=f"Public Note {uuid4().hex[:6]}",
            content="Public content",
            owner_id=owner.id,
            collection_id=created_collection.id,
            visibility=VisibilityEnum.PUBLIC,
        )
    )
    _clear_scope_cache()

    items, total = note_list_for_user(other, NoteSearchParams())
    assert total == 1
    assert {item.id for item in items} == {public_note.id}

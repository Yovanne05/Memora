"""Unit-ish tests focused on repository favorite filtering (no HTTP layer)."""
from uuid import uuid4

from daos.favorite_dao import NoteFavorite, CollectionFavorite
from daos.user_dao import User
from dtos.collection_dto import CollectionCreateDTO
from dtos.note_dto import NoteCreateDTO
from repositorys import (
    user_repository,
    note_favorite_repository,
    collection_favorite_repository,
    collection_repository,
)
from repositorys.note_repository import NoteSearchParams, list_for_user as note_list_for_user
from repositorys.collection_repository import (
    CollectionSearchParams,
    list_for_user as collection_list_for_user,
)
from services.impl.note.note_crud_service_impl import note_crud_service
from mappers.collection_mapper import dto_to_collection
from utils.enums import RoleEnum, VisibilityEnum


def _create_user(email_prefix: str) -> User:
    suffix = uuid4().hex[:8]
    user = User(
        email=f"{email_prefix}-{suffix}@example.com",
        username=f"{email_prefix}-{suffix}",
        display_name=f"{email_prefix} user",
        password_hash="hash",  # NOSONAR - test only
        role=RoleEnum.CLIENT,
    )
    return user_repository.add(user)


def _create_collection(owner_id: str):
    dto = CollectionCreateDTO(
        name=f"Collection-{uuid4().hex[:6]}",
        description="For favorite repository tests",
        owner_id=owner_id,
        visibility=VisibilityEnum.PRIVATE,
    )
    entity = dto_to_collection(dto)
    return collection_repository.add(entity)


def _create_note(owner_id: str, collection_id: str):
    dto = NoteCreateDTO(
        title=f"Note-{uuid4().hex[:6]}",
        content="Content",
        owner_id=owner_id,
        collection_id=collection_id,
        visibility=VisibilityEnum.PRIVATE,
    )
    return note_crud_service.create(dto)


def test_note_repository_filters_favorites():
    owner = _create_user("fav-owner")
    collection = _create_collection(owner.id)
    favorite_note = _create_note(owner.id, collection.id)
    _create_note(owner.id, collection.id)  # non-favorite

    note_favorite_repository.add(
        NoteFavorite(user_id=owner.id, note_id=favorite_note.id)
    )

    items, total = note_list_for_user(
        owner, NoteSearchParams(is_favorite=True)
    )

    assert total == 1
    assert {item.id for item in items} == {favorite_note.id}


def test_collection_repository_filters_favorites():
    owner = _create_user("fav-collection-owner")
    collection_fav = _create_collection(owner.id)
    _create_collection(owner.id)

    collection_favorite_repository.add(
        CollectionFavorite(
            user_id=owner.id, collection_id=collection_fav.id
        )
    )

    items, total = collection_list_for_user(
        owner, CollectionSearchParams(is_favorite=True)
    )

    assert total == 1
    assert {item.id for item in items} == {collection_fav.id}

from daos.collection_dao import Collection
from dtos.collection_dto import CollectionUpdateDTO
from exceptions.collection_exception import CollectionNotFound
from exceptions.share_collection_exception import (
    CollectionShareAlreadyExists,
    CollectionShareTargetDoesNotExist,
    CollectionShareWithOwnerForbidden,
)


def apply_collection_update(collection_entity : Collection, collection_update_dto : CollectionUpdateDTO ) -> Collection :
    if collection_update_dto.name is not None :
        collection_entity.name = collection_update_dto.name

    if collection_update_dto.description is not None :
        collection_entity.description = collection_update_dto.description

    if collection_update_dto.visibility is not None :
        collection_entity.visibility = collection_update_dto.visibility

    if collection_update_dto.tags is not None :
        collection_entity.tags = collection_update_dto.tags

    return collection_entity


def ensure_collection_exists(collection_entity) -> Collection:
    """Validates that a collection exists, raises CollectionNotFound if not."""
    if not collection_entity:
        raise CollectionNotFound()
    return collection_entity


def ensure_user_exists(user_entity) -> None:
    """Validates that a user exists, raises CollectionShareTargetDoesNotExist if not."""
    if not user_entity:
        raise CollectionShareTargetDoesNotExist()


def ensure_not_sharing_with_owner(owner_id: str, target_user_id: str) -> None:
    """Validates that the target user is not the owner, raises CollectionShareWithOwnerForbidden if so."""
    if owner_id == target_user_id:
        raise CollectionShareWithOwnerForbidden()


def ensure_share_does_not_exist(share_entity) -> None:
    """Validates that a share does not already exist, raises CollectionShareAlreadyExists if it does."""
    if share_entity:
        raise CollectionShareAlreadyExists()

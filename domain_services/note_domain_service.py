from daos.note_dao import Note
from dtos.note_dto import NoteUpdateDTO
from exceptions.note_exception import (
    NoteCollectionDoesNotExist,
    NoteNotFound,
    NoteOwnerDoesNotExist,
    NoteTitleConflict,
)
from exceptions.note_link_exception import (
    NoteLinkAlreadyExists,
    NoteLinkCollectionChangeForbidden,
    NoteLinkCrossCollection,
    NoteLinkSelfReferenceForbidden,
)
from exceptions.note_share_exception import (
    NoteShareAlreadyExists,
    NoteShareTargetDoesNotExist,
    NoteShareWithOwnerForbidden,
)


def apply_note_update(note_entity: Note, note_update_dto: NoteUpdateDTO) -> Note:
    if note_update_dto.title is not None:
        note_entity.title = note_update_dto.title

    if note_update_dto.content is not None:
        note_entity.content = note_update_dto.content

    if note_update_dto.visibility is not None:
        note_entity.visibility = note_update_dto.visibility

    if "collection_id" in note_update_dto.model_fields_set:
        note_entity.collection_id = note_update_dto.collection_id

    if note_update_dto.tags is not None:
        note_entity.tags = note_update_dto.tags

    return note_entity


def ensure_note_exists(note_entity) -> Note:
    """Validates that a note exists, raises NoteNotFound if not."""
    if not note_entity:
        raise NoteNotFound()
    return note_entity


def ensure_owner_exists(user_entity) -> None:
    """Validates that the owner exists, raises NoteOwnerDoesNotExist if not."""
    if not user_entity:
        raise NoteOwnerDoesNotExist()


def ensure_collection_allowed(collection_entity) -> None:
    """Validates that the collection exists and belongs to the owner, raises NoteCollectionDoesNotExist if not."""
    if not collection_entity:
        raise NoteCollectionDoesNotExist()


def ensure_unique_title(existing_note, exclude_id: str | None = None) -> None:
    """Validates that the title is unique, raises NoteTitleConflict if not."""
    if existing_note and existing_note.id != exclude_id:
        raise NoteTitleConflict()


def ensure_collection_change_allowed(note_links) -> None:
    """Validates that collection change is allowed, raises NoteLinkCollectionChangeForbidden if links exist."""
    if note_links:
        raise NoteLinkCollectionChangeForbidden()


def ensure_share_target_exists(user_entity) -> None:
    """Validates that the share target user exists, raises NoteShareTargetDoesNotExist if not."""
    if not user_entity:
        raise NoteShareTargetDoesNotExist()


def ensure_not_sharing_with_owner(owner_id: str, target_user_id: str) -> None:
    """Validates that the target user is not the owner, raises NoteShareWithOwnerForbidden if so."""
    if owner_id == target_user_id:
        raise NoteShareWithOwnerForbidden()


def ensure_note_share_does_not_exist(share_entity) -> None:
    """Validates that a share does not already exist, raises NoteShareAlreadyExists if it does."""
    if share_entity:
        raise NoteShareAlreadyExists()


def ensure_not_self_link(note_id: str, linked_note_id: str) -> None:
    """Validates that a note is not linked to itself, raises NoteLinkSelfReferenceForbidden if so."""
    if note_id == linked_note_id:
        raise NoteLinkSelfReferenceForbidden()


def ensure_same_collection(first: Note, second: Note) -> None:
    """Validates that two notes are in the same collection, raises NoteLinkCrossCollection if not."""
    if not first.collection_id or not second.collection_id:
        raise NoteLinkCrossCollection()

    if first.collection_id != second.collection_id:
        raise NoteLinkCrossCollection()


def ensure_note_link_does_not_exist(link_entity) -> None:
    """Validates that a link does not already exist, raises NoteLinkAlreadyExists if it does."""
    if link_entity:
        raise NoteLinkAlreadyExists()

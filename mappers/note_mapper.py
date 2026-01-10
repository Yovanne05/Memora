from typing import Optional, List

from sqlalchemy import inspect

from daos.note_dao import Note
from dtos.note_dto import NoteCreateDTO, NoteDTO
from dtos.user_access_dto import UserAccessDTO
from utils.enums import SharePermissionEnum


def _get_user_access(note: Note) -> List[UserAccessDTO]:
    access_list: list[UserAccessDTO] = []

    insp = inspect(note)
    if "owner" not in insp.unloaded and note.owner:
        access_list.append(
            UserAccessDTO(
                user_id=note.owner_id,
                permission=SharePermissionEnum.WRITE,
            )
        )

    if "shares" not in insp.unloaded:
        for share in note.shares:
            access_list.append(
                UserAccessDTO(
                    user_id=share.user_id,
                    permission=share.permission,
                )
            )

    return access_list


def _safe_collection_name(note: Note) -> Optional[str]:
    if not note.collection_id:
        return None
    insp = inspect(note)
    if "collection" in insp.unloaded:
        return None
    return note.collection.name if note.collection else None


def _safe_owner_username(note: Note) -> str:
    insp = inspect(note)
    if "owner" in insp.unloaded or not note.owner:
        return ""
    return note.owner.username or ""


def note_to_dto(
    note: Note,
    favorite_note_ids: set[str] | None = None,
    current_user=None,
) -> NoteDTO:
    is_favorite = False
    if favorite_note_ids is not None:
        is_favorite = note.id in favorite_note_ids

    data = {
        "id": note.id,
        "owner_id": note.owner_id,
        "owner_username": _safe_owner_username(note),
        "title": note.title,
        "visibility": note.visibility,
        "user_access": _get_user_access(note),
        "collection_id": note.collection_id,
        "tags": note.tags,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
        "collection_name": _safe_collection_name(note),
        "is_favorite": is_favorite,
        "yjs_snapshot": getattr(note, "yjs_snapshot", None),
    }

    return NoteDTO.model_validate(data)


def dto_to_note(note_create_dto: NoteCreateDTO) -> Note:
    return Note(
        title=note_create_dto.title,
        owner_id=note_create_dto.owner_id,
        collection_id=note_create_dto.collection_id,
        visibility=note_create_dto.visibility,
        tags=note_create_dto.tags,

        yjs_snapshot=note_create_dto.yjs_snapshot,
    )

from typing import Optional, List
from typing import Optional

from sqlalchemy import inspect

from daos.note_dao import Note
from domain_services.permission_domain_service import permission_domain_service
from dtos.note_dto import NoteCreateDTO, NoteDTO
from utils.permission_models import AccessLevel
from domain_services.permission_domain_service import permission_domain_service
from dtos.owner_dto import OwnerDTO
from utils.enums import SharePermissionEnum


def _get_all_owners(note: Note) -> List[OwnerDTO]:
    """
    Récupère tous les propriétaires (owners) de la note :
    - Le créateur original (owner_id)
    - Tous les utilisateurs ayant reçu permission OWNER via NoteShare
    """
    owners = []

    # Ajouter le créateur original
    insp = inspect(note)
    if "owner" not in insp.unloaded and note.owner:
        owners.append(OwnerDTO(user_id=note.owner_id, username=note.owner.username))

    # Ajouter tous ceux qui ont permission OWNER via NoteShare
    if "shares" not in insp.unloaded:
        for share in note.shares:
            if share.permission == SharePermissionEnum.OWNER:
                # Charger l'utilisateur si nécessaire
                share_insp = inspect(share)
                if "user" not in share_insp.unloaded and share.user:
                    owners.append(OwnerDTO(user_id=share.user_id, username=share.user.username))

    return owners


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
    return note.owner.username or note.owner.display_name or ""


def note_to_dto(
    note: Note,
    favorite_note_ids: set[str] | None = None,
    current_user=None,
) -> NoteDTO:
    is_favorite = False
    if favorite_note_ids is not None:
        is_favorite = note.id in favorite_note_ids

    # Calculate user permission
    user_permission_str = None
    if current_user:
        perm = permission_domain_service.get_note_permission(
            note.id, current_user.id, current_user.role
        )
        perm_level = perm.access_level
        if perm_level == AccessLevel.OWNER:
            user_permission_str = "owner"
        elif perm_level == AccessLevel.WRITE:
            user_permission_str = "write"
        elif perm_level == AccessLevel.READ:
            user_permission_str = "read"
        elif perm_level == AccessLevel.ADMIN:
            user_permission_str = "owner"  # Admin has owner-level access

    data = {
        "id": note.id,
        "owner_id": note.owner_id,
        "owner_username": _safe_owner_username(note),
        "title": note.title,
        "content": note.content,
        "visibility": note.visibility,
        "owners": _get_all_owners(note),
        "collection_id": note.collection_id,
        "tags": note.tags,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
        "collection_name": _safe_collection_name(note),
        "is_favorite": is_favorite,
        "user_permission": user_permission_str,
    }
    return NoteDTO.model_validate(data)


def dto_to_note(note_create_dto: NoteCreateDTO) -> Note:
    return Note(
        title=note_create_dto.title,
        content=note_create_dto.content,
        owner_id=note_create_dto.owner_id,
        collection_id=note_create_dto.collection_id,
        visibility=note_create_dto.visibility,
        tags=note_create_dto.tags,
    )

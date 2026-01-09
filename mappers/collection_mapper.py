from typing import List, Set, Optional
from sqlalchemy import inspect

from daos.collection_dao import Collection
from daos.note_dao import Note

from dtos.collection_dto import CollectionCreateDTO, CollectionDTO
from dtos.note_dto import NoteDTO
from dtos.owner_dto import OwnerDTO
from mappers.note_mapper import note_to_dto
from domain_services.permission_domain_service import permission_domain_service
from utils.permission_models import AccessLevel
from utils.enums import SharePermissionEnum


def _get_all_owners(collection: Collection) -> List[OwnerDTO]:
    """
    Récupère tous les propriétaires (owners) de la collection :
    - Le créateur original (owner_id)
    - Tous les utilisateurs ayant reçu permission OWNER via CollectionShare
    """
    owners = []

    # Ajouter le créateur original
    insp = inspect(collection)
    if "owner" not in insp.unloaded and collection.owner:
        owners.append(OwnerDTO(user_id=collection.owner_id, username=collection.owner.username))

    # Ajouter tous ceux qui ont permission OWNER via CollectionShare
    if "shares" not in insp.unloaded:
        for share in collection.shares:
            if share.permission == SharePermissionEnum.OWNER:
                # Charger l'utilisateur si nécessaire
                share_insp = inspect(share)
                if "user" not in share_insp.unloaded and share.user:
                    owners.append(OwnerDTO(user_id=share.user_id, username=share.user.username))

    return owners


def _build_note_dtos(
    notes: List[Note], note_favorite_ids: set[str] | None
) -> List[NoteDTO]:
    return [
        note_to_dto(note, favorite_note_ids=note_favorite_ids)
        for note in notes
    ]


def _build_graph_nodes(notes: List[Note]) -> List[dict]:
    return [
        {
            "id": note.id,
            "data": {
                "label": note.title,
                "note_id": note.id,
                "title": note.title,
                "tags": note.tags,
            }
        }
        for note in notes
    ]


def _add_edge_if_new(
    edges: List[dict],
    seen: Set[tuple],
    source_id: str,
    target_id: str,
) -> None:
    edge_key = (source_id, target_id)
    if edge_key not in seen:
        edges.append(
            {
                "id": f"{source_id}-{target_id}",
                "source": source_id,
                "target": target_id,
            }
        )
        seen.add(edge_key)


def _build_graph_edges(notes: List[Note], note_ids: Set[str]) -> List[dict]:
    edges = []
    seen_edges = set()

    for note in notes:
        for link in note.outgoing_links:
            if link.note_id_2 in note_ids:
                _add_edge_if_new(edges, seen_edges, link.note_id_1, link.note_id_2)

        for link in note.incoming_links:
            if link.note_id_1 in note_ids:
                _add_edge_if_new(edges, seen_edges, link.note_id_1, link.note_id_2)

    return edges


def _get_user_permission(collection: Collection, current_user) -> Optional[str]:
    if not current_user:
        return None

    perm = permission_domain_service.get_collection_permission(
        collection.id, current_user.id, current_user.role
    )
    perm_level = perm.access_level
    if perm_level in {AccessLevel.OWNER, AccessLevel.ADMIN}:
        return "owner"
    if perm_level == AccessLevel.WRITE:
        return "write"
    if perm_level == AccessLevel.READ:
        return "read"
    return None


def collection_to_dto(
    collection_entity: Collection,
    collection_favorite_ids: set[str] | None = None,
    note_favorite_ids: set[str] | None = None,
    current_user=None,
) -> CollectionDTO:
    notes = collection_entity.notes
    note_ids = {note.id for note in notes}
    is_favorite = False
    if collection_favorite_ids is not None:
        is_favorite = collection_entity.id in collection_favorite_ids

    return CollectionDTO.model_validate(
        {
            "id": collection_entity.id,
            "owner_id": collection_entity.owner_id,
            "name": collection_entity.name,
            "description": collection_entity.description,
            "visibility": collection_entity.visibility,
            "owners": _get_all_owners(collection_entity),
            "tags": collection_entity.tags,
            "is_favorite": is_favorite,
            "user_permission": _get_user_permission(collection_entity, current_user),
            "created_at": collection_entity.created_at,
            "updated_at": collection_entity.updated_at,
            "notes": _build_note_dtos(notes, note_favorite_ids),
            "nodes": _build_graph_nodes(notes),
            "edges": _build_graph_edges(notes, note_ids),
        }
    )


def dto_to_collection(collection_create_dto: CollectionCreateDTO) -> Collection:
    return Collection(
        name=collection_create_dto.name,
        description=collection_create_dto.description,
        owner_id=collection_create_dto.owner_id,
        visibility=collection_create_dto.visibility,
        tags=collection_create_dto.tags,
    )

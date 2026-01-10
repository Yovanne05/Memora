from typing import List, Set
from sqlalchemy import inspect

from daos.collection_dao import Collection
from daos.note_dao import Note

from dtos.collection_dto import CollectionCreateDTO, CollectionDTO
from dtos.note_dto import NoteDTO
from dtos.user_access_dto import UserAccessDTO
from mappers.note_mapper import note_to_dto
from utils.enums import SharePermissionEnum


def _get_user_access(collection: Collection) -> List[UserAccessDTO]:
    access_list: list[UserAccessDTO] = []

    insp = inspect(collection)
    if "owner" not in insp.unloaded and collection.owner:
        access_list.append(
            UserAccessDTO(
                user_id=collection.owner_id,
                permission=SharePermissionEnum.WRITE,
            )
        )

    if "shares" not in insp.unloaded:
        for share in collection.shares:
            access_list.append(
                UserAccessDTO(
                    user_id=share.user_id,
                    permission=share.permission,
                )
            )

    return access_list


def _build_note_dtos(
    notes: List[Note],
    note_favorite_ids: set[str] | None,
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
            },
        }
        for note in notes
    ]


def _add_edge_if_new(
    edges: List[dict],
    seen: Set[tuple[str, str]],
    source_id: str,
    target_id: str,
    label: str | None,
) -> None:
    edge_key = (source_id, target_id)
    if edge_key in seen:
        return

    edges.append(
        {
            "id": f"{source_id}-{target_id}",
            "source": source_id,
            "target": target_id,
            "label": label or "",
        }
    )
    seen.add(edge_key)


def _build_graph_edges(notes: List[Note], note_ids: Set[str]) -> List[dict]:
    edges: list[dict] = []
    seen_edges: set[tuple[str, str]] = set()

    for note in notes:
        # liens sortants
        for link in note.outgoing_links:
            if link.note_id_2 in note_ids:
                _add_edge_if_new(
                    edges=edges,
                    seen=seen_edges,
                    source_id=link.note_id_1,
                    target_id=link.note_id_2,
                    label=link.label,
                )

        # liens entrants
        for link in note.incoming_links:
            if link.note_id_1 in note_ids:
                _add_edge_if_new(
                    edges=edges,
                    seen=seen_edges,
                    source_id=link.note_id_1,
                    target_id=link.note_id_2,
                    label=link.label,
                )

    return edges


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
            "user_access": _get_user_access(collection_entity),
            "tags": collection_entity.tags,
            "is_favorite": is_favorite,
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

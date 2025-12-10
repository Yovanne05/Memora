from typing import List, Set
from daos.collection_dao import Collection
from daos.note_dao import Note

from dtos.collection_dto import CollectionCreateDTO, CollectionDTO
from dtos.note_dto import NoteDTO
from mappers.note_mapper import note_to_dto_dict


def _build_note_dtos(notes: List[Note], collection_name: str) -> List[NoteDTO]:
    return [
        NoteDTO.model_validate(note_to_dto_dict(note, collection_name_override=collection_name))
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
    target_id: str
) -> None:
    edge_key = (source_id, target_id)
    if edge_key not in seen:
        edges.append({
            "id": f"{source_id}-{target_id}",
            "source": source_id,
            "target": target_id,
        })
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


def collection_to_dto(collection_entity: Collection) -> CollectionDTO:
    notes = collection_entity.notes
    note_ids = {note.id for note in notes}

    return CollectionDTO.model_validate(
        {
            "id": collection_entity.id,
            "name": collection_entity.name,
            "description": collection_entity.description,
            "visibility": collection_entity.visibility,
            "owner_id": collection_entity.owner_id,
            "tags": collection_entity.tags,
            "created_at": collection_entity.created_at,
            "updated_at": collection_entity.updated_at,
            "notes": _build_note_dtos(notes, collection_entity.name),
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
from typing import List, Set
from daos.collection_dao import Collection
from daos.note_dao import Note

from dtos.collection_dto import CollectionCreateDTO, CollectionDTO
from dtos.note_dto import NoteDTO


def _note_to_dto_with_collection_name(note_entity: Note, collection_name: str) -> NoteDTO:
    """Convert note to DTO with explicit collection name (avoids lazy loading)."""
    return NoteDTO.model_validate(
        {
            "id": note_entity.id,
            "title": note_entity.title,
            "content": note_entity.content,
            "visibility": note_entity.visibility,
            "owner_id": note_entity.owner_id,
            "owner_username": note_entity.owner.username,
            "collection_id": note_entity.collection_id,
            "collection_name": collection_name if note_entity.collection_id else None,
            "tags": note_entity.tags,
            "created_at": note_entity.created_at,
            "updated_at": note_entity.updated_at,
        }
    )


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


def _build_graph_edges(notes: List[Note], note_ids: Set[str]) -> List[dict]:
    edges = []
    seen_edges = set()

    for note in notes:
        for link in note.outgoing_links:
            if link.note_id_2 in note_ids:
                edge_key = (link.note_id_1, link.note_id_2)
                if edge_key not in seen_edges:
                    edges.append({
                        "id": f"{link.note_id_1}-{link.note_id_2}",
                        "source": link.note_id_1,
                        "target": link.note_id_2,
                    })
                    seen_edges.add(edge_key)

        for link in note.incoming_links:
            if link.note_id_1 in note_ids:
                edge_key = (link.note_id_1, link.note_id_2)
                if edge_key not in seen_edges:
                    edges.append({
                        "id": f"{link.note_id_1}-{link.note_id_2}",
                        "source": link.note_id_1,
                        "target": link.note_id_2,
                    })
                    seen_edges.add(edge_key)

    return edges


def collection_to_dto(collection_entity: Collection) -> CollectionDTO:
    note_dtos = [
        _note_to_dto_with_collection_name(note, collection_entity.name)
        for note in collection_entity.notes
    ]
    note_ids = {note.id for note in collection_entity.notes}

    nodes = _build_graph_nodes(collection_entity.notes)
    edges = _build_graph_edges(collection_entity.notes, note_ids)

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
            "notes": note_dtos,
            "edges": edges,
            "nodes": nodes,
        }
    )

def dto_to_collection(collection_create_dto : CollectionCreateDTO) -> Collection :
    return Collection(
        name = collection_create_dto.name,
        description = collection_create_dto.description,
        owner_id = collection_create_dto.owner_id,
        visibility = collection_create_dto.visibility,
        tags = collection_create_dto.tags,
    )

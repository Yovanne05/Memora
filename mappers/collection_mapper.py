from daos.collection_dao import Collection

from dtos.collection_dto import CollectionCreateDTO, CollectionDTO
from mappers.note_mapper import note_to_dto


def collection_to_dto(collection_entity: Collection) -> CollectionDTO:
    # Créer les DTOs des notes
    note_dtos = [note_to_dto(note) for note in collection_entity.notes]

    # Créer un set des IDs de notes dans cette collection
    note_ids_in_collection = {note.id for note in collection_entity.notes}

    # Construire les nodes (une node par note)
    nodes = [
        {
            "id": note.id,
            "data": {
                "label": note.title,
                "note_id": note.id,
                "title": note.title,
                "tags": note.tags,
            }
        }
        for note in collection_entity.notes
    ]

    # Construire les edges (liens entre notes de cette collection)
    edges = []
    seen_edges = set()  # Pour éviter les doublons

    for note in collection_entity.notes:
        # Liens sortants
        for link in note.outgoing_links:
            # Ne garder que les liens entre notes de cette collection
            if link.note_id_2 in note_ids_in_collection:
                edge_key = (link.note_id_1, link.note_id_2)
                if edge_key not in seen_edges:
                    edges.append({
                        "id": f"{link.note_id_1}-{link.note_id_2}",
                        "source": link.note_id_1,
                        "target": link.note_id_2,
                    })
                    seen_edges.add(edge_key)

        # Liens entrants
        for link in note.incoming_links:
            # Ne garder que les liens entre notes de cette collection
            if link.note_id_1 in note_ids_in_collection:
                edge_key = (link.note_id_1, link.note_id_2)
                if edge_key not in seen_edges:
                    edges.append({
                        "id": f"{link.note_id_1}-{link.note_id_2}",
                        "source": link.note_id_1,
                        "target": link.note_id_2,
                    })
                    seen_edges.add(edge_key)

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

from daos.collection_dao import Collection

from dtos.collection_dto import CollectionCreateDTO, CollectionDTO
from mappers.note_mapper import note_to_dto


def collection_to_dto(collection_entity: Collection) -> CollectionDTO:
    return CollectionDTO.model_validate(
        {
            "id": collection_entity.id,
            "name": collection_entity.name,
            "description": collection_entity.description,
            "visibility": collection_entity.visibility,
            "owner_id": collection_entity.owner_id,
            "created_at": collection_entity.created_at,
            "updated_at": collection_entity.updated_at,
            "notes": [note_to_dto(note) for note in collection_entity.notes],
        }
    )

def dto_to_collection(collection_create_dto : CollectionCreateDTO) -> Collection :
    return Collection(
        name = collection_create_dto.name,
        description = collection_create_dto.description,
        owner_id = collection_create_dto.owner_id,
        visibility = collection_create_dto.visibility,
    )

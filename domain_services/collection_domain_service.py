from daos.collection_dao import Collection
from dtos.collection_dto import CollectionUpdateDTO

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

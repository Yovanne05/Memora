from daos.collection_dao import CollectionShare
from dtos.collection_share_dto import (
    CollectionShareCreateDTO,
    CollectionShareDTO,
)


def collection_share_to_dto(share_entity: CollectionShare) -> CollectionShareDTO:
    return CollectionShareDTO.model_validate(share_entity)


def dto_to_collection_share(
    collection_id: str, share_create_dto: CollectionShareCreateDTO
) -> CollectionShare:
    return CollectionShare(
        collection_id=collection_id,
        user_id=share_create_dto.user_id,
        permission=share_create_dto.permission,
    )

from daos.collection_share_link_dao import CollectionShareLink
from dtos.collection_share_link_dto import CollectionShareLinkCreateDTO, CollectionShareLinkDTO


def collection_share_link_to_dto(share_link_entity: CollectionShareLink) -> CollectionShareLinkDTO:
    return CollectionShareLinkDTO.model_validate(share_link_entity)


def dto_to_collection_share_link(
    collection_id: str, share_link_create_dto: CollectionShareLinkCreateDTO
) -> CollectionShareLink:
    return CollectionShareLink(
        collection_id=collection_id,
        permission=share_link_create_dto.permission,
    )

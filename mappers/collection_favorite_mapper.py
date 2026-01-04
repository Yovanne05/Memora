from daos.favorite_dao import CollectionFavorite
from dtos.collection_favorite_dto import CollectionFavoriteDTO


def collection_favorite_to_dto(entity: CollectionFavorite) -> CollectionFavoriteDTO:
    return CollectionFavoriteDTO.model_validate(entity)

from daos.favorite_dao import NoteFavorite
from dtos.note_favorite_dto import NoteFavoriteDTO


def note_favorite_to_dto(entity: NoteFavorite) -> NoteFavoriteDTO:
    return NoteFavoriteDTO.model_validate(entity)

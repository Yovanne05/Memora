from daos.tag_dao import Tag
from dtos.tag_dto import TagUpdateDTO


def apply_tag_update(tag_entity: Tag, tag_update_dto: TagUpdateDTO) -> Tag:
    if tag_update_dto.name is not None:
        tag_entity.name = tag_update_dto.name
    return tag_entity

from daos.tag_dao import Tag
from dtos.tag_dto import TagCreateDTO, TagDTO


def tag_to_dto(tag_entity: Tag) -> TagDTO:
    return TagDTO.model_validate(tag_entity)


def dto_to_tag(tag_create_dto: TagCreateDTO) -> Tag:
    return Tag(name=tag_create_dto.name)

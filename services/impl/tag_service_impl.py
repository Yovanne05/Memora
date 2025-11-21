from typing import List, Optional, Tuple

from domain_services.tag_domain_service import apply_tag_update
from dtos.tag_dto import TagCreateDTO, TagDTO, TagUpdateDTO
from exceptions.tag_exception import TagNameConflict, TagNotFound
from mappers.tag_mapper import dto_to_tag, tag_to_dto
from repositorys import tag_repository
from repositorys.tag_repository import TagSearchParams
from services.interfaces.tag_service_interface import TagServiceInterface


class TagService(TagServiceInterface):
    def find_many(
        self, params: Optional[TagSearchParams] = None
    ) -> Tuple[List[TagDTO], int]:
        entities, total = tag_repository.find_many(params)
        return [tag_to_dto(entity) for entity in entities], total

    def find_one(self, tag_id: str) -> TagDTO:
        tag_entity = tag_repository.find_one(tag_id)
        if not tag_entity:
            raise TagNotFound()
        return tag_to_dto(tag_entity)

    def create(self, tag_create_dto: TagCreateDTO) -> TagDTO:
        self._ensure_unique_name(tag_create_dto.name)
        entity = dto_to_tag(tag_create_dto)
        saved = tag_repository.add(entity)
        return tag_to_dto(saved)

    def update(self, tag_id: str, tag_update_dto: TagUpdateDTO) -> TagDTO:
        tag_entity = tag_repository.find_one(tag_id)
        if not tag_entity:
            raise TagNotFound()

        if tag_update_dto.name is not None:
            self._ensure_unique_name(tag_update_dto.name, exclude_id=tag_id)

        updated_entity = apply_tag_update(tag_entity, tag_update_dto)
        saved = tag_repository.update(updated_entity)
        return tag_to_dto(saved)

    def delete(self, tag_id: str) -> None:
        deleted = tag_repository.delete(tag_id)
        if not deleted:
            raise TagNotFound()

    def _ensure_unique_name(self, name: str, exclude_id: str | None = None) -> None:
        existing = tag_repository.find_one_by_name(name)
        if existing and existing.id != exclude_id:
            raise TagNameConflict()


tag_service = TagService()

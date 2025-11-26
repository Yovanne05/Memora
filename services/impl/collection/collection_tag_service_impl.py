from typing import List

from dtos.tag_assignment_dto import TagAssignmentDTO
from dtos.tag_dto import TagDTO
from exceptions.collection_exception import CollectionNotFound
from exceptions.tag_exception import TagNotFound
from mappers.tag_mapper import tag_to_dto
from repositorys import collection_repository, tag_repository
from repositorys.collection_tag_repository import (
    list_tags as repo_list_tags,
    replace_tags as repo_replace_tags,
)
from services.interfaces.collection.collection_tag_service_interface import CollectionTagServiceInterface


class CollectionTagService(CollectionTagServiceInterface):
    def list_tags(self, collection_id: str) -> List[TagDTO]:
        self._get_collection_or_raise(collection_id)
        tags = repo_list_tags(collection_id)
        return [tag_to_dto(tag) for tag in tags]

    def replace_tags(
        self, collection_id: str, payload: TagAssignmentDTO
    ) -> List[TagDTO]:
        self._get_collection_or_raise(collection_id)
        self._ensure_tags_exist(payload.tag_ids)
        tags = repo_replace_tags(collection_id, payload.tag_ids)
        return [tag_to_dto(tag) for tag in tags]

    def _get_collection_or_raise(self, collection_id: str):
        if not collection_repository.find_one(collection_id):
            raise CollectionNotFound()

    def _ensure_tags_exist(self, tag_ids: list[str]) -> None:
        if not tag_ids:
            return
        missing = [tag_id for tag_id in tag_ids if not tag_repository.find_one(tag_id)]
        if missing:
            raise TagNotFound("One or more tags do not exist.")


collection_tag_service = CollectionTagService()

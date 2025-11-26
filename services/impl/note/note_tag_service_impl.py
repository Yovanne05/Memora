from typing import List

from dtos.tag_assignment_dto import TagAssignmentDTO
from dtos.tag_dto import TagDTO
from exceptions.note_exception import NoteNotFound
from exceptions.tag_exception import TagNotFound
from mappers.tag_mapper import tag_to_dto
from repositorys import note_repository, tag_repository
from repositorys.note_tag_repository import list_tags as repo_list_tags
from repositorys.note_tag_repository import replace_tags as repo_replace_tags
from services.interfaces.note.note_tag_service_interface import (
    NoteTagServiceInterface,
)


class NoteTagService(NoteTagServiceInterface):
    def list_tags(self, note_id: str) -> List[TagDTO]:
        self._get_note_or_raise(note_id)
        tags = repo_list_tags(note_id)
        return [tag_to_dto(tag) for tag in tags]

    def replace_tags(self, note_id: str, payload: TagAssignmentDTO) -> List[TagDTO]:
        self._get_note_or_raise(note_id)
        self._ensure_tags_exist(payload.tag_ids)
        tags = repo_replace_tags(note_id, payload.tag_ids)
        return [tag_to_dto(tag) for tag in tags]

    def _get_note_or_raise(self, note_id: str):
        if not note_repository.find_one(note_id):
            raise NoteNotFound()

    def _ensure_tags_exist(self, tag_ids: list[str]) -> None:
        if not tag_ids:
            return
        missing = [tag_id for tag_id in tag_ids if not tag_repository.find_one(tag_id)]
        if missing:
            raise TagNotFound("One or more tags do not exist.")


note_tag_service = NoteTagService()

from domain_services.realtime_collaboration_domain_service import (
    DEFAULT_EMPTY_DOCUMENT,
    ensure_note_exists,
    ensure_user_exists,
    normalize_note_content,
    resolve_note_content,
)
from repositorys import note_repository, user_repository
from services.interfaces.realtime.collaboration_data_service_interface import (
    CollaborationDataServiceInterface,
)


class CollaborationDataService(CollaborationDataServiceInterface):
    def __init__(self, note_repo=note_repository, user_repo=user_repository):
        self._note_repo = note_repo
        self._user_repo = user_repo

    def get_note_or_raise(self, note_id: str):
        note = self._note_repo.find_one_unscoped(note_id)
        ensure_note_exists(note)
        return note

    def get_user_or_raise(self, user_id: str):
        user = self._user_repo.find_one(user_id)
        ensure_user_exists(user)
        return user

    def resolve_and_persist_content(
        self, note_id: str, note, initial_content: str | None
    ) -> str:
        resolved_content = resolve_note_content(note.content, initial_content)
        normalized_content = normalize_note_content(
            resolved_content, fallback=DEFAULT_EMPTY_DOCUMENT
        )
        if normalized_content and note.content != normalized_content:
            note.content = normalized_content
            self._note_repo.update_content(note_id, normalized_content)
        return normalized_content

    @staticmethod
    def normalize_content(content: str | None, fallback: str | None) -> str | None:
        return normalize_note_content(content, fallback=fallback)

    def update_content_if_changed(
        self, note_id: str, note, content: str | None
    ) -> None:
        if content and content != note.content:
            note.content = content
            self._note_repo.update_content(note_id, content)

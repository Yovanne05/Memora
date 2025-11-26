from datetime import datetime
from typing import Optional, Tuple

import config
import pytest

from app import create_app
from dtos.note_dto import NoteCreateDTO, NoteDTO, NoteUpdateDTO
from dtos.note_share_dto import (
    NoteShareCreateDTO,
    NoteShareDTO,
    NoteShareUpdateDTO,
)
from repositorys.note_repository import NoteSearchParams
from services.interfaces.note.note_crud_service_interface import (
    NoteCrudServiceInterface,
)
from services.interfaces.note.note_share_service_interface import (
    NoteShareServiceInterface,
)
from utils.enums import SharePermissionEnum, VisibilityEnum
from controllers import note_controller

NOTE_ID = "11111111-1111-1111-1111-111111111111"
OWNER_ID = "22222222-2222-2222-2222-222222222222"
SHARE_USER_ID = "33333333-3333-3333-3333-333333333333"
COLLECTION_ID = "44444444-4444-4444-4444-444444444444"


class StubNoteCrudService(NoteCrudServiceInterface):
    def __init__(self, note: NoteDTO):
        self.note = note
        self.deleted_ids: list[str] = []
        self.last_find_params: Optional[NoteSearchParams] = None
        self.last_find_one_id: str | None = None
        self.last_create_payload: NoteCreateDTO | None = None
        self.last_update_payload: Tuple[str, NoteUpdateDTO] | None = None

    def find_many(
        self, params: Optional[NoteSearchParams] = None
    ) -> Tuple[list[NoteDTO], int]:
        self.last_find_params = params
        return [self.note], 1

    def find_one(self, note_id: str) -> NoteDTO:
        self.last_find_one_id = note_id
        return self.note

    def create(self, note_create_dto: NoteCreateDTO) -> NoteDTO:
        self.last_create_payload = note_create_dto
        return self.note.model_copy(
            update={
                "title": note_create_dto.title,
                "content": note_create_dto.content,
                "owner_id": note_create_dto.owner_id,
                "collection_id": note_create_dto.collection_id,
                "visibility": note_create_dto.visibility,
            }
        )

    def update(
        self, note_id: str, note_update_dto: NoteUpdateDTO
    ) -> NoteDTO:
        self.last_update_payload = (note_id, note_update_dto)
        updates: dict = {}
        if note_update_dto.title is not None:
            updates["title"] = note_update_dto.title
        if note_update_dto.content is not None:
            updates["content"] = note_update_dto.content
        if note_update_dto.visibility is not None:
            updates["visibility"] = note_update_dto.visibility
        if "collection_id" in note_update_dto.model_fields_set:
            updates["collection_id"] = note_update_dto.collection_id
        return self.note.model_copy(update=updates)

    def delete(self, note_id: str) -> None:
        self.deleted_ids.append(note_id)


class StubNoteShareService(NoteShareServiceInterface):
    def __init__(self, share: NoteShareDTO):
        self.share = share
        self.last_list_note_id: str | None = None
        self.last_share_payload: tuple[str, NoteShareCreateDTO] | None = None
        self.last_update_payload: tuple[
            str, str, NoteShareUpdateDTO
        ] | None = None
        self.revoked: tuple[str, str] | None = None

    def list_shares(self, note_id: str) -> list[NoteShareDTO]:
        self.last_list_note_id = note_id
        return [self.share]

    def share_note(
        self, note_id: str, share_dto: NoteShareCreateDTO
    ) -> NoteShareDTO:
        self.last_share_payload = (note_id, share_dto)
        return self.share.model_copy(
            update={
                "note_id": note_id,
                "user_id": share_dto.user_id,
                "permission": share_dto.permission,
            }
        )

    def update_share(
        self, note_id: str, user_id: str, share_update_dto: NoteShareUpdateDTO
    ) -> NoteShareDTO:
        self.last_update_payload = (note_id, user_id, share_update_dto)
        return self.share.model_copy(
            update={
                "note_id": note_id,
                "user_id": user_id,
                "permission": share_update_dto.permission,
            }
        )

    def revoke_share(self, note_id: str, user_id: str) -> None:
        self.revoked = (note_id, user_id)


@pytest.fixture(autouse=True)
def disable_swagger(monkeypatch):
    monkeypatch.setattr(config, "SWAGGER_ENABLED", False)


@pytest.fixture
def sample_note():
    created = datetime(2024, 1, 1, 12, 0, 0)
    updated = datetime(2024, 1, 2, 12, 0, 0)
    return NoteDTO(
        id=NOTE_ID,
        title="Sample note",
        content="Some content",
        visibility=VisibilityEnum.PRIVATE,
        owner_id=OWNER_ID,
        collection_id=None,
        created_at=created,
        updated_at=updated,
    )


@pytest.fixture
def sample_share():
    created = datetime(2024, 1, 3, 12, 0, 0)
    return NoteShareDTO(
        note_id=NOTE_ID,
        user_id=SHARE_USER_ID,
        permission=SharePermissionEnum.READ,
        created_at=created,
    )


@pytest.fixture
def client_with_note_stubs(monkeypatch, sample_note, sample_share):
    crud_stub = StubNoteCrudService(sample_note)
    share_stub = StubNoteShareService(sample_share)

    monkeypatch.setattr(note_controller, "note_crud_service", crud_stub)
    monkeypatch.setattr(note_controller, "note_share_service", share_stub)

    app = create_app()
    with app.test_client() as client:
        yield client, crud_stub, share_stub

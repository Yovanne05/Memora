from dataclasses import dataclass, field
from uuid import uuid4

import config
import pytest

from app import create_app
from daos.collection_dao import Collection
from daos.user_dao import User
from dtos.note_dto import NoteCreateDTO
from dtos.note_link_dto import NoteLinkCreateDTO
from dtos.note_share_dto import NoteShareCreateDTO
from repositorys import (
    collection_repository,
    note_link_repository,
    note_repository,
    note_share_repository,
    user_repository,
)
from services.impl.note.note_crud_service_impl import note_crud_service
from services.impl.note.note_link_service_impl import note_link_service
from services.impl.note.note_share_service_impl import note_share_service
from utils.enums import RoleEnum, SharePermissionEnum, VisibilityEnum


@pytest.fixture(autouse=True)
def disable_swagger(monkeypatch):
    monkeypatch.setattr(config, "SWAGGER_ENABLED", False)


@dataclass
class NoteTestData:
    owner_id: str = field(default_factory=lambda: str(uuid4()))
    share_user_id: str = field(default_factory=lambda: str(uuid4()))
    collection_id: str = field(default_factory=lambda: str(uuid4()))
    note_id: str | None = None
    linked_note_id: str | None = None

    created_users: set[str] = field(default_factory=set)
    created_collections: set[str] = field(default_factory=set)
    created_notes: set[str] = field(default_factory=set)
    created_shares: set[tuple[str, str]] = field(default_factory=set)
    created_links: set[tuple[str, str]] = field(default_factory=set)

    base_title: str = "Primary integration note"
    linked_title: str = "Secondary integration note"
    search_term: str = "primary"

    def bootstrap(self) -> None:
        self._ensure_user(self.owner_id, label="owner")
        self._ensure_user(self.share_user_id, label="share-target")
        self._ensure_collection()

        self.note_id = self._create_note(
            title=self.base_title,
            content="Primary content used for note controller tests.",
        )
        self.linked_note_id = self._create_note(
            title=self.linked_title,
            content="Linked note content for relationship tests.",
        )

    def _ensure_user(self, user_id: str, label: str) -> None:
        if user_repository.find_one(user_id):
            return

        unique_suffix = str(uuid4())[:8]
        user = User(
            id=user_id,
            email=f"{label}-{unique_suffix}@example.com",
            username=f"{label}-{unique_suffix}",
            display_name=f"{label.capitalize()} user",
            password_hash="test-password-hash",
            role=RoleEnum.CLIENT,
        )
        user_repository.add(user)
        self.created_users.add(user_id)

    def _ensure_collection(self) -> None:
        existing = collection_repository.find_one(self.collection_id)
        if existing:
            if existing.owner_id == self.owner_id:
                return
            self.collection_id = str(uuid4())
        collection = Collection(
            id=self.collection_id,
            owner_id=self.owner_id,
            name="Integration collection",
            description="Collection created for note controller tests.",
            visibility=VisibilityEnum.PRIVATE,
        )
        collection_repository.add(collection)
        self.created_collections.add(self.collection_id)

    def _create_note(self, title: str, content: str) -> str:
        payload = NoteCreateDTO(
            title=title,
            content=content,
            owner_id=self.owner_id,
            collection_id=self.collection_id,
            visibility=VisibilityEnum.PRIVATE,
        )
        note = note_crud_service.create(payload)
        self.created_notes.add(note.id)
        return note.id

    def ensure_share(
        self, permission: SharePermissionEnum = SharePermissionEnum.READ
    ):
        share = note_share_service.share_note(
            self.note_id, NoteShareCreateDTO(user_id=self.share_user_id, permission=permission)
        )
        self.created_shares.add((self.note_id, self.share_user_id))
        return share

    def ensure_link(self):
        link = note_link_service.create_link(
            self.note_id,
            NoteLinkCreateDTO(linked_note_id=self.linked_note_id),
        )
        normalized = tuple(sorted((self.note_id, self.linked_note_id)))
        self.created_links.add(normalized)
        return link

    def track_created_note(self, note_id: str) -> None:
        self.created_notes.add(note_id)

    def track_created_share(self, note_id: str, user_id: str) -> None:
        self.created_shares.add((note_id, user_id))

    def track_created_link(self, note_id: str, linked_note_id: str) -> None:
        self.created_links.add(tuple(sorted((note_id, linked_note_id))))

    def cleanup(self) -> None:
        for link_pair in self.created_links:
            note_link_repository.delete(*link_pair)

        for note_id, user_id in self.created_shares:
            note_share_repository.delete(note_id, user_id)

        for note_id in self.created_notes:
            note_repository.delete(note_id)

        for collection_id in self.created_collections:
            collection_repository.delete(collection_id)

        for user_id in self.created_users:
            user_repository.delete(user_id)


@pytest.fixture
def note_test_data():
    data = NoteTestData()
    data.bootstrap()
    try:
        yield data
    finally:
        data.cleanup()


@pytest.fixture
def client_with_note_data(note_test_data):
    app = create_app()
    with app.test_client() as client:
        yield client, note_test_data

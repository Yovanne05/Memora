from dataclasses import dataclass, field
from uuid import uuid4

import config
import pytest
from werkzeug.test import Client

from app import create_app
from utils.enums import RoleEnum, SharePermissionEnum, VisibilityEnum


@pytest.fixture(autouse=True)
def disable_swagger(monkeypatch):
    monkeypatch.setattr(config, "SWAGGER_ENABLED", False)

@dataclass
class NoteTestData:
    client: Client
    owner_id: str | None = None
    share_user_id: str | None = None
    collection_id: str | None = None
    note_id: str | None = None
    linked_note_id: str | None = None
    collection_name: str = field(default_factory=lambda: f"Integration collection {uuid4().hex[:8]}")

    created_user_ids: set[str] = field(default_factory=set)
    created_collection_ids: set[str] = field(default_factory=set)
    created_note_ids: set[str] = field(default_factory=set)
    created_shares: set[tuple[str, str]] = field(default_factory=set)
    created_links: set[tuple[str, str]] = field(default_factory=set)

    base_slug: str = field(default_factory=lambda: uuid4().hex[:8])
    linked_slug: str = field(default_factory=lambda: uuid4().hex[:8])
    base_title: str | None = None
    linked_title: str | None = None
    search_term: str | None = None

    def bootstrap(self) -> None:
        self.base_title = f"Integration note {self.base_slug}"
        self.linked_title = f"Linked note {self.linked_slug}"
        self.search_term = self.base_slug

        self.owner_id = self._create_user("owner")
        self.share_user_id = self._create_user("share-target")
        self.collection_id = self._create_collection()

        self.note_id = self._create_note(
            title=self.base_title,
            content="Primary content used for note controller tests.",
        )
        self.linked_note_id = self._create_note(
            title=self.linked_title,
            content="Linked note content for relationship tests.",
        )

    def _create_user(self, label: str) -> str:
        unique = uuid4().hex[:8]
        payload = {
            "email": f"{label}-{self.base_slug}-{unique}@example.com",
            "password": f"TestPwd-{self.base_slug}-{unique}",
            "username": f"{label}-{self.base_slug}-{unique}",
            "display_name": f"{label.capitalize()} user {unique}",
            "role": RoleEnum.CLIENT.value,
        }
        response = self.client.post("/users", json=payload)
        assert response.status_code == 201, response.get_data(as_text=True)
        body = response.get_json()
        self.created_user_ids.add(body["id"])
        return body["id"]

    def _create_collection(self) -> str:
        payload = {
            "name": self.collection_name,
            "description": f"Collection created for note controller tests {self.base_slug}.",
            "owner_id": self.owner_id,
            "visibility": VisibilityEnum.PRIVATE.value,
        }
        response = self.client.post("/collections", json=payload)
        assert response.status_code == 201, response.get_data(as_text=True)
        body = response.get_json()
        self.created_collection_ids.add(body["id"])
        return body["id"]

    def _create_note(self, title: str, content: str) -> str:
        payload = {
            "title": title,
            "content": content,
            "owner_id": self.owner_id,
            "collection_id": self.collection_id,
            "visibility": VisibilityEnum.PRIVATE.value,
        }
        response = self.client.post("/notes", json=payload)
        assert response.status_code == 201, response.get_data(as_text=True)
        body = response.get_json()
        self.created_note_ids.add(body["id"])
        return body["id"]

    def ensure_share(
        self, permission: SharePermissionEnum = SharePermissionEnum.READ
    ):
        response = self.client.post(
            f"/notes/{self.note_id}/shares",
            json={
                "user_id": self.share_user_id,
                "permission": permission.value,
            },
        )
        assert response.status_code == 201, response.get_data(as_text=True)
        body = response.get_json()
        self.created_shares.add((self.note_id, self.share_user_id))
        return body

    def ensure_link(self):
        response = self.client.post(
            f"/notes/{self.note_id}/links",
            json={"linked_note_id": self.linked_note_id},
        )
        assert response.status_code == 201, response.get_data(as_text=True)
        body = response.get_json()
        self.created_links.add((self.note_id, self.linked_note_id))
        return body

    def track_created_note(self, note_id: str) -> None:
        self.created_note_ids.add(note_id)

    def track_created_share(self, note_id: str, user_id: str) -> None:
        self.created_shares.add((note_id, user_id))

    def track_created_link(self, note_id: str, linked_note_id: str) -> None:
        self.created_links.add((note_id, linked_note_id))

    def cleanup(self) -> None:
        for note_id, linked_note_id in self.created_links:
            self._delete_if_exists(f"/notes/{note_id}/links/{linked_note_id}")

        for note_id, user_id in self.created_shares:
            self._delete_if_exists(f"/notes/{note_id}/shares/{user_id}")

        for note_id in self.created_note_ids:
            self._delete_if_exists(f"/notes/{note_id}")

        for collection_id in self.created_collection_ids:
            self._delete_if_exists(f"/collections/{collection_id}")

        for user_id in self.created_user_ids:
            self._delete_if_exists(f"/users/{user_id}")

    def _delete_if_exists(self, path: str) -> None:
        response = self.client.delete(path)
        if response.status_code not in (204, 404):
            raise AssertionError(
                f"Cleanup failed for {path}: {response.status_code} {response.get_data(as_text=True)}"
            )


@pytest.fixture
def app_client():
    app = create_app()
    with app.test_client() as client:
        yield client


@pytest.fixture
def note_test_data(app_client):
    data = NoteTestData(client=app_client)
    data.bootstrap()
    try:
        yield data
    finally:
        data.cleanup()


@pytest.fixture
def client_with_note_data(note_test_data):
    yield note_test_data.client, note_test_data

from dataclasses import dataclass, field
from uuid import uuid4

import pytest
from daos.user_dao import User
from dtos.collection_dto import CollectionCreateDTO
from dtos.collection_share_dto import CollectionShareCreateDTO
from repositorys import (
    collection_repository,
    collection_share_repository,
    user_repository,
)
from services.impl.collection.collection_service_impl import collection_service
from services.impl.collection.collection_share_service_impl import (
    collection_share_service,
)
from utils.enums import RoleEnum, SharePermissionEnum, VisibilityEnum

# Test constants
TEST_PASSWORD_HASH = "test-password-hash" # NOSONAR
TEST_PASSWORD = "ValidPass12!" # NOSONAR




@dataclass
class CollectionTestData:
    owner_id: str = field(default_factory=lambda: str(uuid4()))
    share_user_id: str = field(default_factory=lambda: str(uuid4()))
    collection_id: str | None = None

    created_users: set[str] = field(default_factory=set)
    created_collections: set[str] = field(default_factory=set)
    created_shares: set[tuple[str, str]] = field(default_factory=set)

    collection_name: str = field(
        default_factory=lambda: f"Integration collection {uuid4().hex[:8]}"
    )

    def bootstrap(self) -> None:
        self._ensure_user(self.owner_id, label="owner")
        self._ensure_user(self.share_user_id, label="share-target")
        self.collection_id = self._create_collection()

    def _ensure_user(self, user_id: str, label: str) -> None:
        if user_repository.find_one(user_id):
            return

        unique_suffix = str(uuid4())[:8]
        user = User(
            id=user_id,
            email=f"{label}-{unique_suffix}@example.com",
            username=f"{label}-{unique_suffix}",
            display_name=f"{label.capitalize()} user",
            password_hash=TEST_PASSWORD_HASH,
            role=RoleEnum.CLIENT,
        )
        user_repository.add(user)
        self.created_users.add(user_id)

    def _create_collection(self) -> str:
        dto = CollectionCreateDTO(
            name=self.collection_name,
            description="Collection created for collection share tests.",
            owner_id=self.owner_id,
            visibility=VisibilityEnum.PRIVATE,
        )
        created = collection_service.create(dto)
        self.created_collections.add(created.id)
        return created.id

    def ensure_share(
        self, permission: SharePermissionEnum = SharePermissionEnum.READ
    ):
        share = collection_share_service.share_collection(
            self.collection_id,
            CollectionShareCreateDTO(
                collection_id=self.collection_id,
                user_id=self.share_user_id,
                permission=permission,
            ),
        )
        self.created_shares.add((self.collection_id, self.share_user_id))
        return share

    def track_created_share(self, collection_id: str, user_id: str) -> None:
        self.created_shares.add((collection_id, user_id))

    def cleanup(self) -> None:
        """
        Cleanup désactivé car le conftest racine recrée la BD à chaque test.
        """
        pass


@pytest.fixture
def collection_test_data():
    data = CollectionTestData()
    data.bootstrap()
    try:
        yield data
    finally:
        data.cleanup()


@pytest.fixture
def client_with_collection_data(collection_test_data):
    from app import create_app
    app = create_app()
    with app.test_client() as client:
        client.environ_base["REMOTE_ADDR"] = (
            f"12.0.0.{int(uuid4().int % 200) + 1}"
        )
        auth_email = f"auth-{uuid4().hex[:8]}@example.com"
        auth_password = TEST_PASSWORD
        auth_resp = client.post(
            "/users",
            json={
                "email": auth_email,
                "password": auth_password, # NOSONAR
                "username": f"auth-{uuid4().hex[:6]}",
            },
        )
        assert auth_resp.status_code == 201, auth_resp.get_data(as_text=True)
        login_resp = client.post(
            "/sessions",
            json={"identifier": auth_email, "password": auth_password}, # NOSONAR
        )
        assert login_resp.status_code == 200, login_resp.get_data(as_text=True)
        token = login_resp.get_json()["access_token"]
        client.environ_base["HTTP_AUTHORIZATION"] = f"Bearer {token}"
        yield client, collection_test_data

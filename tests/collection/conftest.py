from datetime import datetime

import config
import pytest

from app import create_app
from dtos.collection_share_dto import CollectionShareDTO
from utils.enums import SharePermissionEnum

COLLECTION_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
SHARE_USER_ID = "cccccccc-cccc-cccc-cccc-cccccccccccc"


class StubCollectionShareService:
    def __init__(self, share):
        self.share = share
        self.last_list_collection_id = None
        self.last_share_payload = None
        self.last_update_payload = None
        self.revoked = None

    def list_shares(self, collection_id):
        self.last_list_collection_id = collection_id
        return [self.share]

    def share_collection(self, collection_id, share_dto):
        self.last_share_payload = (collection_id, share_dto)
        return self.share.model_copy(
            update={
                "collection_id": collection_id,
                "user_id": share_dto.user_id,
                "permission": share_dto.permission,
            }
        )

    def update_share(self, collection_id, user_id, share_update_dto):
        self.last_update_payload = (collection_id, user_id, share_update_dto)
        return self.share.model_copy(
            update={
                "collection_id": collection_id,
                "user_id": user_id,
                "permission": share_update_dto.permission,
            }
        )

    def revoke_share(self, collection_id, user_id):
        self.revoked = (collection_id, user_id)


@pytest.fixture(autouse=True)
def disable_swagger(monkeypatch):
    monkeypatch.setattr(config, "SWAGGER_ENABLED", False)


@pytest.fixture
def sample_share():
    created = datetime(2024, 1, 3, 12, 0, 0)
    return CollectionShareDTO(
        collection_id=COLLECTION_ID,
        user_id=SHARE_USER_ID,
        permission=SharePermissionEnum.READ,
        created_at=created,
    )


@pytest.fixture
def client_with_collection_share_stub(monkeypatch, sample_share):
    from controllers import collection_controller

    share_stub = StubCollectionShareService(sample_share)

    monkeypatch.setattr(
        collection_controller, "collection_share_service", share_stub
    )

    app = create_app()
    with app.test_client() as client:
        yield client, share_stub

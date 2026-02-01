"""
Tests pour POST /collections/<id>/shares (create share).

Le service collection_share_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime
from utils.enums import RoleEnum


class TestShareCollectionControllerCreate:
    """Tests pour POST /collections/<id>/shares"""

    def test_create_share_returns_201(self, authenticated_client, mock_collection_share_service):
        """Le endpoint POST /collections/<id>/shares retourne 201."""
        from dtos.collection_share_dto import CollectionShareDTO
        from dtos.user_dto import UserDTO
        from utils.enums import SharePermissionEnum

        # Arrange
        collection_id = str(uuid4())
        user_id = str(uuid4())

        user_dto = UserDTO(
            id=user_id,
            email="target@example.com",
            username="target",
            role=RoleEnum.CLIENT,
            created_at=datetime.now()
        )

        share = CollectionShareDTO(
            collection_id=collection_id,
            user=user_dto,
            permission=SharePermissionEnum.WRITE,
            created_at=datetime.now()
        )
        mock_collection_share_service.share_collection.return_value = share

        payload = {
            "user_id": user_id,
            "permission": "write"
        }

        # Act
        response = authenticated_client.post(f"/collections/{collection_id}/shares", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["collection_id"] == collection_id
        assert body["user"]["id"] == user_id
        mock_collection_share_service.share_collection.assert_called_once()

"""
Tests pour POST /collections/<id>/public-links (create link).

Le service collection_share_link_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus


class TestCollectionShareLinkControllerCreate:
    """Tests pour POST /collections/<id>/public-links"""

    def test_create_share_link_returns_201(self, authenticated_client, mock_collection_share_link_service):
        """Le endpoint POST /collections/<id>/public-links retourne 201."""
        from dtos.collection_share_link_dto import CollectionShareLinkDTO
        from utils.enums import SharePermissionEnum

        # Arrange
        collection_id = str(uuid4())
        link = CollectionShareLinkDTO(
            id=str(uuid4()),
            collection_id=collection_id,
            permission=SharePermissionEnum.READ,
            created_at="2024-01-01T00:00:00Z"
        )
        mock_collection_share_link_service.create_share_link.return_value = link

        payload = {
            "permission": "read"
        }

        # Act
        response = authenticated_client.post(f"/collections/{collection_id}/public-links", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["collection_id"] == collection_id
        mock_collection_share_link_service.create_share_link.assert_called_once()

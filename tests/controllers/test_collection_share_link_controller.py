"""
Tests pour le controller collection_share_link (routing et HTTP).

Ces tests vérifient :
- GET /collections/<id>/public-links (liste des liens publics)
- POST /collections/<id>/public-links (créer un lien public)
- DELETE /collections/<id>/public-links/<link_id> (supprimer un lien public)

Le service collection_share_link_service est MOCKÉ.
"""
import pytest
from uuid import uuid4
from http import HTTPStatus


class TestCollectionShareLinkControllerList:
    """Tests pour GET /collections/<id>/public-links"""

    def test_list_share_links_returns_200(self, app_client, mock_collection_share_link_service):
        """Le endpoint GET /collections/<id>/public-links retourne 200."""
        from dtos.collection_share_link_dto import CollectionShareLinkDTO
        from utils.enums import PermissionEnum

        # Arrange
        collection_id = str(uuid4())
        links = [
            CollectionShareLinkDTO(
                id=str(uuid4()),
                collection_id=collection_id,
                token="abc123",
                permission=PermissionEnum.READ,
                created_at="2024-01-01T00:00:00Z"
            )
        ]
        mock_collection_share_link_service.find_many.return_value = (links, 1)

        # Act
        response = app_client.get(f"/collections/{collection_id}/public-links")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert "items" in body
        assert "total" in body
        assert body["total"] == 1


class TestCollectionShareLinkControllerCreate:
    """Tests pour POST /collections/<id>/public-links"""

    def test_create_share_link_returns_201(self, app_client, mock_collection_share_link_service):
        """Le endpoint POST /collections/<id>/public-links retourne 201."""
        from dtos.collection_share_link_dto import CollectionShareLinkDTO
        from utils.enums import PermissionEnum

        # Arrange
        collection_id = str(uuid4())
        link = CollectionShareLinkDTO(
            id=str(uuid4()),
            collection_id=collection_id,
            token="xyz789",
            permission=PermissionEnum.READ,
            created_at="2024-01-01T00:00:00Z"
        )
        mock_collection_share_link_service.create_share_link.return_value = link

        payload = {
            "permission": "read"
        }

        # Act
        response = app_client.post(f"/collections/{collection_id}/public-links", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["collection_id"] == collection_id
        assert "token" in body
        mock_collection_share_link_service.create_share_link.assert_called_once()


class TestCollectionShareLinkControllerDelete:
    """Tests pour DELETE /collections/<id>/public-links/<link_id>"""

    def test_delete_share_link_returns_204(self, app_client, mock_collection_share_link_service):
        """Le endpoint DELETE /collections/<id>/public-links/<link_id> retourne 204."""
        # Arrange
        collection_id = str(uuid4())
        link_id = str(uuid4())
        mock_collection_share_link_service.delete_share_link.return_value = None

        # Act
        response = app_client.delete(f"/collections/{collection_id}/public-links/{link_id}")

        # Assert
        assert response.status_code == HTTPStatus.NO_CONTENT
        mock_collection_share_link_service.delete_share_link.assert_called_once_with(collection_id, link_id)

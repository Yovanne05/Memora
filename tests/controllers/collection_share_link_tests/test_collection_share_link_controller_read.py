"""
Tests pour le controller collection_share_link (routing et HTTP).

Ces tests vérifient :
- GET /collections/<id>/public-links (liste des liens publics)
- POST /collections/<id>/public-links (créer un lien public)
- DELETE /collections/<id>/public-links/<link_id> (supprimer un lien public)

Le service collection_share_link_service est MOCKÉ.
"""
from uuid import uuid4
from http import HTTPStatus


class TestCollectionShareLinkControllerList:
    """Tests pour GET /collections/<id>/public-links"""

    def test_list_share_links_returns_200(self, authenticated_client, mock_collection_share_link_service):
        """Le endpoint GET /collections/<id>/public-links retourne 200."""
        from dtos.collection_share_link_dto import CollectionShareLinkDTO
        from utils.enums import SharePermissionEnum

        # Arrange
        collection_id = str(uuid4())
        links = [
            CollectionShareLinkDTO(
                id=str(uuid4()),
                collection_id=collection_id,
                permission=SharePermissionEnum.READ,
                created_at="2024-01-01T00:00:00Z"
            )
        ]
        mock_collection_share_link_service.find_many.return_value = (links, 1)

        # Act
        response = authenticated_client.get(f"/collections/{collection_id}/public-links")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert "items" in body
        assert "total" in body
        assert body["total"] == 1

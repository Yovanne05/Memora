"""
Tests pour DELETE /collections/<id>/public-links/<link_id> (delete link).

Le service collection_share_link_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus


class TestCollectionShareLinkControllerDelete:
    """Tests pour DELETE /collections/<id>/public-links/<link_id>"""

    def test_delete_share_link_returns_204(self, authenticated_client, mock_collection_share_link_service):
        """Le endpoint DELETE /collections/<id>/public-links/<link_id> retourne 204."""
        # Arrange
        collection_id = str(uuid4())
        link_id = str(uuid4())
        mock_collection_share_link_service.delete_share_link.return_value = None

        # Act
        response = authenticated_client.delete(f"/collections/{collection_id}/public-links/{link_id}")

        # Assert
        assert response.status_code == HTTPStatus.NO_CONTENT
        mock_collection_share_link_service.delete_share_link.assert_called_once_with(collection_id, link_id)

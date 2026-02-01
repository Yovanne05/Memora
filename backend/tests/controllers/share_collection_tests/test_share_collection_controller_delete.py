"""
Tests pour DELETE /collections/<id>/shares/<id> (delete share).

Le service collection_share_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus


class TestShareCollectionControllerDelete:
    """Tests pour DELETE /collections/<id>/shares/<id>"""

    def test_delete_share_returns_204(self, authenticated_client, mock_collection_share_service):
        """Le endpoint DELETE /collections/<id>/shares/<id> retourne 204."""
        # Arrange
        collection_id = str(uuid4())
        share_id = str(uuid4())
        mock_collection_share_service.revoke_share.return_value = None

        # Act
        response = authenticated_client.delete(f"/collections/{collection_id}/shares/{share_id}")

        # Assert
        assert response.status_code == HTTPStatus.NO_CONTENT
        mock_collection_share_service.revoke_share.assert_called_once_with(collection_id, share_id)

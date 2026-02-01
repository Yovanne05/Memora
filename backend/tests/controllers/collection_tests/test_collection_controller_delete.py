"""
Tests pour DELETE /collections/<id> (delete).

Le service collection_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus
from exceptions.collection_exception import CollectionNotFound


class TestCollectionControllerDelete:
    """Tests pour DELETE /collections/<id>"""

    def test_delete_collection_returns_204(self, authenticated_client, mock_collection_service):
        """Le endpoint DELETE /collections/<id> retourne 204."""
        # Arrange
        collection_id = str(uuid4())
        mock_collection_service.delete.return_value = None

        # Act
        response = authenticated_client.delete(f"/collections/{collection_id}")

        # Assert
        assert response.status_code == HTTPStatus.NO_CONTENT
        assert response.data == b""
        mock_collection_service.delete.assert_called_once_with(collection_id)

    def test_delete_collection_returns_404_when_not_found(self, authenticated_client, mock_collection_service):
        """Le endpoint retourne 404 si la collection n'existe pas."""
        # Arrange
        collection_id = str(uuid4())
        mock_collection_service.delete.side_effect = CollectionNotFound()

        # Act
        response = authenticated_client.delete(f"/collections/{collection_id}")

        # Assert
        assert response.status_code == HTTPStatus.NOT_FOUND

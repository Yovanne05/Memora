"""
Tests pour PATCH /collections/<id> (update).

Le service collection_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime
from dtos.collection_dto import CollectionDTO
from utils.enums import VisibilityEnum
from exceptions.collection_exception import CollectionNotFound


class TestCollectionControllerUpdate:
    """Tests pour PATCH /collections/<id>"""

    def test_update_collection_returns_200(self, authenticated_client, mock_collection_service):
        """Le endpoint PATCH /collections/<id> retourne 200 avec la collection mise a jour."""
        # Arrange
        collection_id = str(uuid4())
        updated_collection = CollectionDTO(
            id=collection_id,
            owner_id=str(uuid4()),
            name="Updated Name",
            description="Updated desc",
            visibility=VisibilityEnum.PUBLIC,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            tags=[]
        )
        mock_collection_service.update.return_value = updated_collection

        payload = {
            "name": "Updated Name",
            "description": "Updated desc"
        }

        # Act
        response = authenticated_client.patch(f"/collections/{collection_id}", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["name"] == "Updated Name"
        mock_collection_service.update.assert_called_once()

    def test_update_collection_returns_404_when_not_found(self, authenticated_client, mock_collection_service):
        """Le endpoint retourne 404 si la collection n'existe pas."""
        # Arrange
        collection_id = str(uuid4())
        mock_collection_service.update.side_effect = CollectionNotFound()

        payload = {"name": "New Name"}

        # Act
        response = authenticated_client.patch(f"/collections/{collection_id}", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.NOT_FOUND

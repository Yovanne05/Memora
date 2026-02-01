"""
Tests pour POST /collections (create).

Le service collection_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime
from dtos.collection_dto import CollectionDTO
from utils.enums import VisibilityEnum
from exceptions.user_exception import UserNotFound
from exceptions.collection_exception import CollectionTitleConflict


class TestCollectionControllerCreate:
    """Tests pour POST /collections"""

    def test_create_collection_returns_201(self, authenticated_client, mock_collection_service):
        """Le endpoint POST /collections retourne 201 avec la collection creee."""
        # Arrange
        owner_id = str(uuid4())
        created_collection = CollectionDTO(
            id=str(uuid4()),
            owner_id=owner_id,
            name="New Collection",
            description="New desc",
            visibility=VisibilityEnum.PRIVATE,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            tags=[]
        )
        mock_collection_service.create.return_value = created_collection

        payload = {
            "name": "New Collection",
            "description": "New desc",
            "owner_id": owner_id,
            "visibility": VisibilityEnum.PRIVATE.value
        }

        # Act
        response = authenticated_client.post("/collections", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["id"] == created_collection.id
        assert body["name"] == "New Collection"
        mock_collection_service.create.assert_called_once()

    def test_create_collection_validates_payload(self, authenticated_client, mock_collection_service):
        """Le endpoint valide le payload (name requis, etc.)."""
        # Arrange: payload invalide (name manquant)
        payload = {
            "description": "Desc without name",
            "owner_id": str(uuid4())
        }

        # Act
        response = authenticated_client.post("/collections", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
        mock_collection_service.create.assert_not_called()

    def test_create_collection_returns_409_on_duplicate(self, authenticated_client, mock_collection_service):
        """Le endpoint retourne 409 si le nom existe deja."""
        # Arrange
        mock_collection_service.create.side_effect = CollectionTitleConflict()

        payload = {
            "name": "Duplicate Name",
            "description": "Desc",
            "owner_id": str(uuid4())
        }

        # Act
        response = authenticated_client.post("/collections", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CONFLICT

    def test_create_collection_returns_404_on_invalid_owner(self, authenticated_client, mock_collection_service):
        """Le endpoint retourne 404 si l'owner n'existe pas."""
        # Arrange
        mock_collection_service.create.side_effect = UserNotFound()

        payload = {
            "name": "Collection",
            "description": "Desc",
            "owner_id": str(uuid4())
        }

        # Act
        response = authenticated_client.post("/collections", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.NOT_FOUND

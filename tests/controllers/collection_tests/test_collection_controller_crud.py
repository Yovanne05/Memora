"""
Tests pour le controller de collection (couche HTTP/REST).

Ces tests vérifient uniquement la couche controller :
- Routing (endpoints corrects)
- Validation des entrées (via Pydantic)
- Sérialisation des sorties (DTOs → JSON)
- Codes de statut HTTP corrects

Le service collection_service est MOCKÉ pour isoler le controller.
"""
import pytest
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime
from dtos.collection_dto import CollectionDTO
from utils.enums import VisibilityEnum
from exceptions.user_exception import UserNotFound
from exceptions.collection_exception import CollectionNotFound, CollectionTitleConflict


class TestCollectionControllerCreate:
    """Tests pour POST /collections (create)"""

    def test_create_collection_returns_201(self, app_client, mock_collection_service):
        """Le endpoint POST /collections retourne 201 avec la collection créée."""
        # Arrange
        owner_id = str(uuid4())
        created_collection = CollectionDTO(
            id=str(uuid4()),
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
        response = app_client.post("/collections", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["id"] == created_collection.id
        assert body["name"] == "New Collection"
        mock_collection_service.create.assert_called_once()

    def test_create_collection_validates_payload(self, app_client, mock_collection_service):
        """Le endpoint valide le payload (name requis, etc.)."""
        # Arrange: payload invalide (name manquant)
        payload = {
            "description": "Desc without name",
            "owner_id": str(uuid4())
        }

        # Act
        response = app_client.post("/collections", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
        mock_collection_service.create.assert_not_called()

    def test_create_collection_returns_409_on_duplicate(self, app_client, mock_collection_service):
        """Le endpoint retourne 409 si le nom existe déjà."""
        # Arrange
        mock_collection_service.create.side_effect = CollectionTitleConflict()

        payload = {
            "name": "Duplicate Name",
            "description": "Desc",
            "owner_id": str(uuid4())
        }

        # Act
        response = app_client.post("/collections", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CONFLICT

    def test_create_collection_returns_422_on_invalid_owner(self, app_client, mock_collection_service):
        """Le endpoint retourne 404 si l'owner n'existe pas."""
        # Arrange
        mock_collection_service.create.side_effect = UserNotFound()

        payload = {
            "name": "Collection",
            "description": "Desc",
            "owner_id": str(uuid4())
        }

        # Act
        response = app_client.post("/collections", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.NOT_FOUND


class TestCollectionControllerUpdate:
    """Tests pour PATCH /collections/<id> (update)"""

    def test_update_collection_returns_200(self, app_client, mock_collection_service):
        """Le endpoint PATCH /collections/<id> retourne 200 avec la collection mise à jour."""
        # Arrange
        collection_id = str(uuid4())
        updated_collection = CollectionDTO(
            id=collection_id,
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
        response = app_client.patch(f"/collections/{collection_id}", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["name"] == "Updated Name"
        mock_collection_service.update.assert_called_once()

    def test_update_collection_returns_404_when_not_found(self, app_client, mock_collection_service):
        """Le endpoint retourne 404 si la collection n'existe pas."""
        # Arrange
        collection_id = str(uuid4())
        mock_collection_service.update.side_effect = CollectionNotFound()

        payload = {"name": "New Name"}

        # Act
        response = app_client.patch(f"/collections/{collection_id}", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.NOT_FOUND


class TestCollectionControllerDelete:
    """Tests pour DELETE /collections/<id> (delete)"""

    def test_delete_collection_returns_204(self, app_client, mock_collection_service):
        """Le endpoint DELETE /collections/<id> retourne 204."""
        # Arrange
        collection_id = str(uuid4())
        mock_collection_service.delete.return_value = None

        # Act
        response = app_client.delete(f"/collections/{collection_id}")

        # Assert
        assert response.status_code == HTTPStatus.NO_CONTENT
        assert response.data == b""
        mock_collection_service.delete.assert_called_once_with(collection_id)

    def test_delete_collection_returns_404_when_not_found(self, app_client, mock_collection_service):
        """Le endpoint retourne 404 si la collection n'existe pas."""
        # Arrange
        collection_id = str(uuid4())
        mock_collection_service.delete.side_effect = CollectionNotFound()

        # Act
        response = app_client.delete(f"/collections/{collection_id}")

        # Assert
        assert response.status_code == HTTPStatus.NOT_FOUND

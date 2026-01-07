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

from dtos.collection_dto import CollectionDTO
from utils.enums import VisibilityEnum
from exceptions.user_exception import UserNotFound
from exceptions.collection_exception import CollectionNotFound, CollectionTitleConflict


class TestCollectionControllerList:
    """Tests pour GET /collections (list)"""

    def test_list_collections_returns_200(self, app_client, mock_collection_service):
        """Le endpoint GET /collections retourne 200 avec une liste."""
        # Arrange: Le service retourne 2 collections
        mock_collection_service.find_many.return_value = (
            [
                CollectionDTO(
                    id=str(uuid4()),
                    name="Collection 1",
                    description="Desc 1",
                    owner_id=str(uuid4()),
                    visibility=VisibilityEnum.PRIVATE,
                    created_at="2024-01-01T00:00:00Z",
                    tags=[]
                ),
                CollectionDTO(
                    id=str(uuid4()),
                    name="Collection 2",
                    description="Desc 2",
                    owner_id=str(uuid4()),
                    visibility=VisibilityEnum.PUBLIC,
                    created_at="2024-01-02T00:00:00Z",
                    tags=[]
                ),
            ],
            2  # total
        )

        # Act
        response = app_client.get("/collections")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert "items" in body
        assert "total" in body
        assert len(body["items"]) == 2
        assert body["total"] == 2
        mock_collection_service.find_many.assert_called_once()

    def test_list_collections_with_filters(self, app_client, mock_collection_service):
        """Le endpoint accepte les query parameters de filtrage."""
        # Arrange
        mock_collection_service.find_many.return_value = ([], 0)

        # Act
        response = app_client.get("/collections?name=test&visibility=public")

        # Assert
        assert response.status_code == HTTPStatus.OK
        mock_collection_service.find_many.assert_called_once()
        # Vérifier que les params ont été passés au service
        call_args = mock_collection_service.find_many.call_args[0][0]
        assert call_args.name == "test"
        assert call_args.visibility == VisibilityEnum.PUBLIC


class TestCollectionControllerGet:
    """Tests pour GET /collections/<id> (get one)"""

    def test_get_collection_returns_200(self, app_client, mock_collection_service):
        """Le endpoint GET /collections/<id> retourne 200 avec la collection."""
        # Arrange
        collection_id = str(uuid4())
        mock_collection_service.find_one.return_value = CollectionDTO(
            id=collection_id,
            name="Test Collection",
            description="Test desc",
            owner_id=str(uuid4()),
            visibility=VisibilityEnum.PRIVATE,
            created_at="2024-01-01T00:00:00Z",
            tags=[]
        )

        # Act
        response = app_client.get(f"/collections/{collection_id}")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["id"] == collection_id
        assert body["name"] == "Test Collection"
        mock_collection_service.find_one.assert_called_once_with(collection_id)

    def test_get_collection_returns_404_when_not_found(self, app_client, mock_collection_service):
        """Le endpoint retourne 404 si la collection n'existe pas."""
        # Arrange
        collection_id = str(uuid4())
        mock_collection_service.find_one.side_effect = CollectionNotFound()

        # Act
        response = app_client.get(f"/collections/{collection_id}")

        # Assert
        assert response.status_code == HTTPStatus.NOT_FOUND


class TestCollectionControllerCreate:
    """Tests pour POST /collections (create)"""

    def test_create_collection_returns_201(self, app_client, mock_collection_service):
        """Le endpoint POST /collections retourne 201 avec la collection créée."""
        # Arrange
        created_collection = CollectionDTO(
            id=str(uuid4()),
            name="New Collection",
            description="New desc",
            owner_id=str(uuid4()),
            visibility=VisibilityEnum.PRIVATE,
            created_at="2024-01-01T00:00:00Z",
            tags=[]
        )
        mock_collection_service.create.return_value = created_collection

        payload = {
            "name": "New Collection",
            "description": "New desc",
            "owner_id": created_collection.owner_id,
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
        """Le endpoint retourne 422 si l'owner n'existe pas."""
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
        assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY


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
            owner_id=str(uuid4()),
            visibility=VisibilityEnum.PUBLIC,
            created_at="2024-01-01T00:00:00Z",
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
        mock_collection_service.update.assert_called_once_with(collection_id, payload)

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

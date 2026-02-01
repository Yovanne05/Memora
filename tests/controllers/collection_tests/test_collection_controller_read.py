"""
Tests pour le controller de collection (couche HTTP/REST).

Ces tests vérifient uniquement la couche controller :
- Routing (endpoints corrects)
- Validation des entrées (via Pydantic)
- Sérialisation des sorties (DTOs → JSON)
- Codes de statut HTTP corrects

Le service collection_service est MOCKÉ pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime
from dtos.collection_dto import CollectionDTO
from utils.enums import VisibilityEnum
from exceptions.collection_exception import CollectionNotFound


class TestCollectionControllerList:
    """Tests pour GET /collections (list)"""

    def test_list_collections_returns_200(self, authenticated_client, mock_collection_service):
        """Le endpoint GET /collections retourne 200 avec une liste."""
        # Arrange: Le service retourne 2 collections
        mock_collection_service.find_many.return_value = (
            [
                CollectionDTO(
                    id=str(uuid4()),
                    owner_id=str(uuid4()),
                    name="Collection 1",
                    description="Desc 1",
                    visibility=VisibilityEnum.PRIVATE,
                    created_at=datetime.now(),
                    updated_at=datetime.now(),
                    tags=[]
                ),
                CollectionDTO(
                    id=str(uuid4()),
                    owner_id=str(uuid4()),
                    name="Collection 2",
                    description="Desc 2",
                    visibility=VisibilityEnum.PUBLIC,
                    created_at=datetime.now(),
                    updated_at=datetime.now(),
                    tags=[]
                ),
            ],
            2  # total
        )

        # Act
        response = authenticated_client.get("/collections")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert "items" in body
        assert "total" in body
        assert len(body["items"]) == 2
        assert body["total"] == 2
        mock_collection_service.find_many.assert_called_once()

    def test_list_collections_with_filters(self, authenticated_client, mock_collection_service):
        """Le endpoint accepte les query parameters de filtrage."""
        # Arrange
        mock_collection_service.find_many.return_value = ([], 0)

        # Act
        response = authenticated_client.get("/collections?title_contains=test&visibility=public")

        # Assert
        assert response.status_code == HTTPStatus.OK
        mock_collection_service.find_many.assert_called_once()
        # Vérifier que les params ont été passés au service
        call_args = mock_collection_service.find_many.call_args[0][0]
        assert call_args.title_contains == "test"
        assert call_args.visibility == VisibilityEnum.PUBLIC


class TestCollectionControllerGet:
    """Tests pour GET /collections/<id> (get one)"""

    def test_get_collection_returns_200(self, authenticated_client, mock_collection_service):
        """Le endpoint GET /collections/<id> retourne 200 avec la collection."""
        # Arrange
        collection_id = str(uuid4())
        mock_collection_service.find_one.return_value = CollectionDTO(
            id=collection_id,
            owner_id=str(uuid4()),
            name="Test Collection",
            description="Test desc",
            visibility=VisibilityEnum.PRIVATE,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            tags=[]
        )

        # Act
        response = authenticated_client.get(f"/collections/{collection_id}")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["id"] == collection_id
        assert body["name"] == "Test Collection"
        mock_collection_service.find_one.assert_called_once_with(collection_id)

    def test_get_collection_returns_404_when_not_found(self, authenticated_client, mock_collection_service):
        """Le endpoint retourne 404 si la collection n'existe pas."""
        # Arrange
        collection_id = str(uuid4())
        mock_collection_service.find_one.side_effect = CollectionNotFound()

        # Act
        response = authenticated_client.get(f"/collections/{collection_id}")

        # Assert
        assert response.status_code == HTTPStatus.NOT_FOUND

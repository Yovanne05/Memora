"""
Tests pour le controller share_collection (routing et HTTP).

Ces tests vérifient :
- GET /collections/<id>/shares (liste des partages)
- POST /collections/<id>/shares (partager une collection)
- PATCH /collections/<id>/shares/<id> (modifier un partage)
- DELETE /collections/<id>/shares/<id> (supprimer un partage)

Le service collection_share_service est MOCKÉ.
"""
import pytest
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime


class TestShareCollectionControllerList:
    """Tests pour GET /collections/<id>/shares"""

    def test_list_shares_returns_200(self, authenticated_client, mock_collection_share_service):
        """Le endpoint GET /collections/<id>/shares retourne 200."""
        from dtos.collection_share_dto import CollectionShareDTO
        from utils.enums import SharePermissionEnum

        # Arrange
        collection_id = str(uuid4())
        shares = [
            CollectionShareDTO(
                id=str(uuid4()),
                collection_id=collection_id,
                user_id=str(uuid4()),
                permission=SharePermissionEnum.READ,
                created_at=datetime.now()
            )
        ]
        mock_collection_share_service.find_many.return_value = (shares, 1)

        # Act
        response = authenticated_client.get(f"/collections/{collection_id}/shares")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert "items" in body
        assert "total" in body
        assert body["total"] == 1


class TestShareCollectionControllerCreate:
    """Tests pour POST /collections/<id>/shares"""

    def test_create_share_returns_201(self, authenticated_client, mock_collection_share_service):
        """Le endpoint POST /collections/<id>/shares retourne 201."""
        from dtos.collection_share_dto import CollectionShareDTO
        from utils.enums import SharePermissionEnum

        # Arrange
        collection_id = str(uuid4())
        user_id = str(uuid4())

        share = CollectionShareDTO(
            id=str(uuid4()),
            collection_id=collection_id,
            user_id=user_id,
            permission=SharePermissionEnum.WRITE,
            created_at=datetime.now()
        )
        mock_collection_share_service.share_collection.return_value = share

        payload = {
            "user_id": user_id,
            "permission": "write"
        }

        # Act
        response = authenticated_client.post(f"/collections/{collection_id}/shares", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["collection_id"] == collection_id
        assert body["user_id"] == user_id
        mock_collection_share_service.share_collection.assert_called_once()


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

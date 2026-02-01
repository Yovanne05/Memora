"""
Tests pour le controller share_collection (routing et HTTP).

Ces tests vérifient :
- GET /collections/<id>/shares (liste des partages)
- POST /collections/<id>/shares (partager une collection)
- PATCH /collections/<id>/shares/<id> (modifier un partage)
- DELETE /collections/<id>/shares/<id> (supprimer un partage)

Le service collection_share_service est MOCKÉ.
"""
from uuid import uuid4
from http import HTTPStatus
from utils.enums import RoleEnum
from datetime import datetime


class TestShareCollectionControllerList:
    """Tests pour GET /collections/<id>/shares"""

    def test_list_shares_returns_200(self, authenticated_client, mock_collection_share_service):
        """Le endpoint GET /collections/<id>/shares retourne 200."""
        from dtos.collection_share_dto import CollectionShareDTO
        from dtos.user_dto import UserDTO
        from utils.enums import SharePermissionEnum

        # Arrange
        collection_id = str(uuid4())

        user1 = UserDTO(
            id=str(uuid4()),
            email="user1@example.com",
            username="user1",
            role=RoleEnum.CLIENT,
            created_at=datetime.now()
        )

        shares = [
            CollectionShareDTO(
                collection_id=collection_id,
                user=user1,
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

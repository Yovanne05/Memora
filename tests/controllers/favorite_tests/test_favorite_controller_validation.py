"""
Tests pour les controllers favorite (routing et HTTP).

Ces tests vérifient :
- POST /notes/<id>/favorites (ajouter aux favoris)
- DELETE /notes/<id>/favorites (retirer des favoris)
- POST /collections/<id>/favorites (ajouter collection)
- DELETE /collections/<id>/favorites (retirer collection)

Les services sont MOCKÉS.
"""
import pytest
from uuid import uuid4
from http import HTTPStatus


class TestNoteFavoriteController:
    """Tests pour les favoris de notes"""

    def test_add_note_favorite_returns_201(self, app_client, mock_note_favorite_service):
        """Le endpoint POST /notes/<id>/favorites retourne 201."""
        from dtos.note_favorite_dto import NoteFavoriteDTO

        # Arrange
        note_id = str(uuid4())
        favorite = NoteFavoriteDTO(
            user_id=str(uuid4()),
            note_id=note_id,
            created_at="2024-01-01T00:00:00Z"
        )
        mock_note_favorite_service.add_favorite.return_value = favorite

        # Act
        response = app_client.post(f"/notes/{note_id}/favorites")

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["note_id"] == note_id
        mock_note_favorite_service.add_favorite.assert_called_once_with(note_id)

    def test_remove_note_favorite_returns_204(self, app_client, mock_note_favorite_service):
        """Le endpoint DELETE /notes/<id>/favorites retourne 204."""
        # Arrange
        note_id = str(uuid4())
        mock_note_favorite_service.remove_favorite.return_value = None

        # Act
        response = app_client.delete(f"/notes/{note_id}/favorites")

        # Assert
        assert response.status_code == HTTPStatus.NO_CONTENT
        mock_note_favorite_service.remove_favorite.assert_called_once_with(note_id)


class TestCollectionFavoriteController:
    """Tests pour les favoris de collections"""

    def test_add_collection_favorite_returns_201(self, app_client, mock_collection_favorite_service):
        """Le endpoint POST /collections/<id>/favorites retourne 201."""
        from dtos.collection_favorite_dto import CollectionFavoriteDTO

        # Arrange
        collection_id = str(uuid4())
        favorite = CollectionFavoriteDTO(
            user_id=str(uuid4()),
            collection_id=collection_id,
            created_at="2024-01-01T00:00:00Z"
        )
        mock_collection_favorite_service.add_favorite.return_value = favorite

        # Act
        response = app_client.post(f"/collections/{collection_id}/favorites")

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["collection_id"] == collection_id
        mock_collection_favorite_service.add_favorite.assert_called_once_with(collection_id)

    def test_remove_collection_favorite_returns_204(self, app_client, mock_collection_favorite_service):
        """Le endpoint DELETE /collections/<id>/favorites retourne 204."""
        # Arrange
        collection_id = str(uuid4())
        mock_collection_favorite_service.remove_favorite.return_value = None

        # Act
        response = app_client.delete(f"/collections/{collection_id}/favorites")

        # Assert
        assert response.status_code == HTTPStatus.NO_CONTENT
        mock_collection_favorite_service.remove_favorite.assert_called_once_with(collection_id)

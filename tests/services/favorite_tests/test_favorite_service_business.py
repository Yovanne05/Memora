"""
Tests pour les services favorite (logique métier).

Ces tests vérifient :
- Ajouter/retirer des favoris pour notes et collections
- Validation des contraintes (note/collection existe)
- Liste des favoris

Les repositories sont MOCKÉS.
"""
from datetime import datetime
from uuid import uuid4
from dtos.note_favorite_dto import NoteFavoriteDTO
from dtos.collection_favorite_dto import CollectionFavoriteDTO
from daos.favorite_dao import NoteFavorite, CollectionFavorite
from exceptions.favorite_exception import FavoriteNotFound
from exceptions.note_exception import NoteNotFound
from exceptions.collection_exception import CollectionNotFound


class TestNoteFavoriteService:
    """Tests pour les favoris de notes"""

    def test_add_favorite_success(self, mock_note_favorite_repository, mock_note_repository, make_note, make_user, monkeypatch):
        """Ajouter une note aux favoris."""
        from services.impl.favorite.note_favorite_service_impl import note_favorite_service
        from utils.enums import RoleEnum

        # Arrange
        user_id = str(uuid4())
        note_id = str(uuid4())

        current_user = make_user(
            user_id=user_id,
            email="test@example.com",
            username="test",
            role=RoleEnum.CLIENT,
        )
        monkeypatch.setattr("services.impl.favorite.note_favorite_service_impl.get_current_user", lambda: current_user)

        note = make_note(
            note_id=note_id,
            owner_id=user_id,
            collection_id=str(uuid4()),
            title="Test",
        )
        mock_note_repository.get_for_user.return_value = note
        mock_note_favorite_repository.find_one.return_value = None

        favorite = NoteFavorite(user_id=user_id, note_id=note_id, created_at=datetime.now())
        mock_note_favorite_repository.add.return_value = favorite

        # Act
        result = note_favorite_service.add_favorite(note_id)

        # Assert
        assert isinstance(result, NoteFavoriteDTO)
        assert result.note_id == note_id
        mock_note_repository.get_for_user.assert_called_once()
        mock_note_favorite_repository.add.assert_called_once()

    def test_remove_favorite_success(self, mock_note_favorite_repository, mock_note_repository, make_note, make_user, monkeypatch):
        """Retirer une note des favoris."""
        from services.impl.favorite.note_favorite_service_impl import note_favorite_service
        from utils.enums import RoleEnum

        # Arrange
        user_id = str(uuid4())
        note_id = str(uuid4())

        current_user = make_user(
            user_id=user_id,
            email="test@example.com",
            username="test",
            role=RoleEnum.CLIENT,
        )
        monkeypatch.setattr("services.impl.favorite.note_favorite_service_impl.get_current_user", lambda: current_user)

        note = make_note(
            note_id=note_id,
            owner_id=user_id,
            collection_id=str(uuid4()),
            title="Test",
        )
        mock_note_repository.get_for_user.return_value = note

        favorite = NoteFavorite(user_id=user_id, note_id=note_id, created_at=datetime.now())
        mock_note_favorite_repository.find_one.return_value = favorite
        mock_note_favorite_repository.delete.return_value = True

        # Act
        note_favorite_service.remove_favorite(note_id)

        # Assert
        mock_note_favorite_repository.delete.assert_called_once_with(user_id, note_id)


class TestCollectionFavoriteService:
    """Tests pour les favoris de collections"""

    def test_add_favorite_success(self, mock_collection_favorite_repository, mock_collection_repository, make_collection, make_user, monkeypatch):
        """Ajouter une collection aux favoris."""
        from services.impl.favorite.collection_favorite_service_impl import collection_favorite_service
        from utils.enums import RoleEnum

        # Arrange
        user_id = str(uuid4())
        collection_id = str(uuid4())

        current_user = make_user(
            user_id=user_id,
            email="test@example.com",
            username="test",
            role=RoleEnum.CLIENT,
        )
        monkeypatch.setattr("services.impl.favorite.collection_favorite_service_impl.get_current_user", lambda: current_user)

        collection = make_collection(
            collection_id=collection_id,
            owner_id=user_id,
            name="Test",
        )
        mock_collection_repository.get_for_user.return_value = collection
        mock_collection_favorite_repository.find_one.return_value = None

        favorite = CollectionFavorite(user_id=user_id, collection_id=collection_id, created_at=datetime.now())
        mock_collection_favorite_repository.add.return_value = favorite

        # Act
        result = collection_favorite_service.add_favorite(collection_id)

        # Assert
        assert isinstance(result, CollectionFavoriteDTO)
        assert result.collection_id == collection_id
        mock_collection_repository.get_for_user.assert_called_once()
        mock_collection_favorite_repository.add.assert_called_once()

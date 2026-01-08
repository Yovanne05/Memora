"""
Tests pour les repositories favorite (accès base de données).

Ces tests vérifient :
- Ajouter/supprimer des favoris
- Récupérer favoris par user
- Contraintes uniques (user_id, note_id/collection_id)

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
import pytest
from datetime import datetime
from uuid import uuid4

from daos.favorite_dao import NoteFavorite, CollectionFavorite
from repositorys import note_favorite_repository, collection_favorite_repository


class TestNoteFavoriteRepository:
    """Tests pour les favoris de notes"""

    def test_add_note_favorite_success(self, test_factory):
        """Ajouter une note aux favoris."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)
        note_id = test_factory.create_note(owner_id=user_id, collection_id=collection_id)

        favorite = NoteFavorite(
            
            user_id=user_id,
            note_id=note_id
        )

        # Act
        result = note_favorite_repository.add(favorite)

        # Assert
        # Composite key: (user_id, note_id)
        assert result.user_id == user_id
        assert result.note_id == note_id

    def test_find_one_note_favorite(self, test_factory):
        """Récupérer un favori de note."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)
        note_id = test_factory.create_note(owner_id=user_id, collection_id=collection_id)

        favorite = NoteFavorite(user_id=user_id, note_id=note_id)
        note_favorite_repository.add(favorite)

        # Act
        result = note_favorite_repository.find_one(user_id, note_id)

        # Assert
        assert result is not None
        assert result.user_id == user_id
        assert result.note_id == note_id

    def test_delete_note_favorite(self, test_factory):
        """Supprimer un favori de note."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)
        note_id = test_factory.create_note(owner_id=user_id, collection_id=collection_id)

        favorite = NoteFavorite(user_id=user_id, note_id=note_id)
        added = note_favorite_repository.add(favorite)

        # Act
        note_favorite_repository.delete(user_id, note_id)

        # Assert
        result = note_favorite_repository.find_one(user_id, note_id)
        assert result is None


class TestCollectionFavoriteRepository:
    """Tests pour les favoris de collections"""

    def test_add_collection_favorite_success(self, test_factory):
        """Ajouter une collection aux favoris."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)

        favorite = CollectionFavorite(
            
            user_id=user_id,
            collection_id=collection_id
        )

        # Act
        result = collection_favorite_repository.add(favorite)

        # Assert
        # Composite key: (user_id, note_id)
        assert result.user_id == user_id
        assert result.collection_id == collection_id

    def test_find_one_collection_favorite(self, test_factory):
        """Récupérer un favori de collection."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)

        favorite = CollectionFavorite(user_id=user_id, collection_id=collection_id)
        collection_favorite_repository.add(favorite)

        # Act
        result = collection_favorite_repository.find_one(user_id, collection_id)

        # Assert
        assert result is not None
        assert result.user_id == user_id
        assert result.collection_id == collection_id

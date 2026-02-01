"""
Tests pour le repository note (accès base de données).

Ces tests vérifient l'interaction avec la base de données :
- Insertion, mise à jour, suppression de notes
- Requêtes SQL (filtres, tri, pagination)
- Contraintes de base de données (foreign keys, titre unique par collection)
- Recherche et scoping des notes

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from uuid import uuid4
from repositorys import note_repository
from repositorys.note_repository import NoteSearchParams
from utils.enums import VisibilityEnum


class TestNoteRepositoryFindOne:
    """Tests pour la récupération d'une note"""

    def test_find_one_unscoped_success(self, test_factory):
        """Récupérer une note par ID (sans scope)."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)
        note_id = test_factory.create_note(owner_id=user_id, collection_id=collection_id, title="Find Me")

        # Act
        result = note_repository.find_one_unscoped(note_id)

        # Assert
        assert result is not None
        assert result.id == note_id
        assert result.title == "Find Me"
        assert result.owner_id == user_id

    def test_find_one_unscoped_not_found(self):
        """Récupérer une note inexistante retourne None."""
        # Arrange
        non_existent_id = str(uuid4())

        # Act
        result = note_repository.find_one_unscoped(non_existent_id)

        # Assert
        assert result is None

    def test_find_one_by_title(self, test_factory):
        """Récupérer une note par titre."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)
        note_id = test_factory.create_note(
            owner_id=user_id,
            collection_id=collection_id,
            title="Unique Title"
        )

        # Act
        result = note_repository.find_one_by_title(user_id, collection_id, "Unique Title")

        # Assert
        assert result is not None
        assert result.id == note_id
        assert result.title == "Unique Title"


class TestNoteRepositoryFindMany:
    """Tests pour la récupération de plusieurs notes"""

    def test_list_for_user_returns_all(self, test_factory):
        """Récupérer toutes les notes d'un utilisateur."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)

        test_factory.create_note(owner_id=user_id, collection_id=collection_id, title="Note 1")
        test_factory.create_note(owner_id=user_id, collection_id=collection_id, title="Note 2")
        test_factory.create_note(owner_id=user_id, collection_id=collection_id, title="Note 3")

        from daos.user_dao import User
        user = User(id=user_id, email="test@example.com", username="test", password_hash="hash")
        params = NoteSearchParams()

        # Act
        results, total = note_repository.list_for_user(user, params)

        # Assert
        assert total >= 3  # Au moins les 3 qu'on a créées
        assert len(results) >= 3

    def test_list_for_user_filters_by_collection(self, test_factory):
        """Filtrer les notes par collection_id."""
        # Arrange
        user_id = test_factory.create_user()
        collection1_id = test_factory.create_collection(owner_id=user_id, name="Collection 1")
        collection2_id = test_factory.create_collection(owner_id=user_id, name="Collection 2")

        test_factory.create_note(owner_id=user_id, collection_id=collection1_id, title="Note C1-1")
        test_factory.create_note(owner_id=user_id, collection_id=collection1_id, title="Note C1-2")
        test_factory.create_note(owner_id=user_id, collection_id=collection2_id, title="Note C2-1")

        from daos.user_dao import User
        user = User(id=user_id, email="test@example.com", username="test", password_hash="hash")
        params = NoteSearchParams(collection_id=collection1_id)

        # Act
        results, total = note_repository.list_for_user(user, params)

        # Assert
        assert total == 2
        assert all(r.collection_id == collection1_id for r in results)

    def test_list_for_user_filters_by_visibility(self, test_factory):
        """Filtrer les notes par visibility."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)

        test_factory.create_note(owner_id=user_id, collection_id=collection_id, title="Private 1", visibility=VisibilityEnum.PRIVATE)
        test_factory.create_note(owner_id=user_id, collection_id=collection_id, title="Private 2", visibility=VisibilityEnum.PRIVATE)
        test_factory.create_note(owner_id=user_id, collection_id=collection_id, title="Public 1", visibility=VisibilityEnum.PUBLIC)

        from daos.user_dao import User
        user = User(id=user_id, email="test@example.com", username="test", password_hash="hash")
        params = NoteSearchParams(visibility=VisibilityEnum.PRIVATE)

        # Act
        results, total = note_repository.list_for_user(user, params)

        # Assert
        assert total >= 2
        assert all(r.visibility == VisibilityEnum.PRIVATE for r in results)

    def test_list_for_user_pagination(self, test_factory):
        """La pagination fonctionne correctement."""
        # Arrange
        user_id = test_factory.create_user()
        collection_id = test_factory.create_collection(owner_id=user_id)

        for i in range(10):
            test_factory.create_note(owner_id=user_id, collection_id=collection_id, title=f"Note {i}")

        from daos.user_dao import User
        user = User(id=user_id, email="test@example.com", username="test", password_hash="hash")
        params = NoteSearchParams(
            limit=5,
            offset=0
        )

        # Act
        results, total = note_repository.list_for_user(user, params)

        # Assert
        assert total == 10
        assert len(results) == 5

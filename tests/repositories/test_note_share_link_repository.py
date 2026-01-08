"""
Tests pour le repository note_share_link (accès base de données).

Ces tests vérifient :
- Ajouter un lien de partage public
- Récupérer un lien par ID
- Lister les liens par note
- Supprimer un lien

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
import pytest
from datetime import datetime
from uuid import uuid4

from daos.note_share_link_dao import NoteShareLink
from repositorys import note_share_link_repository
from utils.enums import SharePermissionEnum


class TestNoteShareLinkRepositoryAdd:
    """Tests pour ajouter un lien"""

    def test_add_share_link_success(self, test_factory):
        """Ajouter un lien de partage public."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)
        note_id = test_factory.create_note(owner_id=owner_id, collection_id=collection_id)

        link = NoteShareLink(
            id=str(uuid4()),
            note_id=note_id,
            permission=SharePermissionEnum.READ
        )

        # Act
        result = note_share_link_repository.add(link)

        # Assert
        assert result.id is not None
        assert result.note_id == note_id
        assert result.token == "abc123xyz"
        assert result.permission == SharePermissionEnum.READ


class TestNoteShareLinkRepositoryFind:
    """Tests pour récupérer un lien"""

    def test_find_one_by_id(self, test_factory):
        """Récupérer un lien par ID."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)
        note_id = test_factory.create_note(owner_id=owner_id, collection_id=collection_id)

        link = NoteShareLink(
            id=str(uuid4()),
            note_id=note_id,
            permission=SharePermissionEnum.READ
        )
        added = note_share_link_repository.add(link)

        # Act
        result = note_share_link_repository.find_one(added.id)

        # Assert
        assert result is not None
        assert result.id == added.id
        assert result.token == "test-token"

    def test_find_one_by_token(self, test_factory):
        """Récupérer un lien par token."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)
        note_id = test_factory.create_note(owner_id=owner_id, collection_id=collection_id)

        link = NoteShareLink(
            id=str(uuid4()),
            note_id=note_id,
            permission=SharePermissionEnum.WRITE
        )
        note_share_link_repository.add(link)

        # Act
        result = note_share_link_repository.find_by_token("unique-token")

        # Assert
        assert result is not None
        assert result.token == "unique-token"
        assert result.note_id == note_id


class TestNoteShareLinkRepositoryList:
    """Tests pour lister les liens"""

    def test_find_many_filters_by_note_id(self, test_factory):
        """Lister les liens filtre par note_id."""
        from repositorys.note_share_link_repository import NoteShareLinkSearchParams

        # Arrange
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)
        note_id = test_factory.create_note(owner_id=owner_id, collection_id=collection_id)

        link1 = NoteShareLink(
            id=str(uuid4()),
            note_id=note_id,
            permission=SharePermissionEnum.READ
        )
        link2 = NoteShareLink(
            id=str(uuid4()),
            note_id=note_id,
            permission=SharePermissionEnum.WRITE
        )
        note_share_link_repository.add(link1)
        note_share_link_repository.add(link2)

        params = NoteShareLinkSearchParams(note_id=note_id)

        # Act
        links, total = note_share_link_repository.find_many(params)

        # Assert
        assert total == 2
        assert len(links) == 2
        assert all(link.note_id == note_id for link in links)


class TestNoteShareLinkRepositoryDelete:
    """Tests pour supprimer un lien"""

    def test_delete_share_link_success(self, test_factory):
        """Supprimer un lien de partage."""
        # Arrange
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)
        note_id = test_factory.create_note(owner_id=owner_id, collection_id=collection_id)

        link = NoteShareLink(
            id=str(uuid4()),
            note_id=note_id,
            permission=SharePermissionEnum.READ
        )
        added = note_share_link_repository.add(link)

        # Act
        deleted = note_share_link_repository.delete(added.id)

        # Assert
        assert deleted is True
        result = note_share_link_repository.find_one(added.id)
        assert result is None

"""
Configuration des tests pour les repositories.

Les tests de repositories utilisent la vraie base de données de test (SQLite in-memory)
via le test_factory pour créer des données de test.

Cela permet de tester les requêtes SQL et la persistance réelle des données.
"""
import pytest
from datetime import datetime
from uuid import uuid4

# Le test_factory est hérité de tests/conftest.py
# Aucune fixture supplémentaire n'est nécessaire pour l'instant

# =============================================================================
# FIXTURES UTILITAIRES POUR LES TESTS DE REPOSITORIES
# =============================================================================

@pytest.fixture
def sample_user_data():
    """Données d'exemple pour créer un utilisateur."""
    return {
        "email": f"user-{uuid4().hex[:8]}@example.com",
        "username": f"user-{uuid4().hex[:6]}",
        "display_name": "Test User",
        "password": "TestPassword1!"  # NOSONAR
    }


@pytest.fixture
def sample_collection_data(test_factory):
    """Données d'exemple pour créer une collection."""
    user_id = test_factory.create_user()
    return {
        "name": f"Test Collection {uuid4().hex[:4]}",
        "description": "Test collection description",
        "owner_id": user_id
    }


@pytest.fixture
def sample_note_data(test_factory):
    """Données d'exemple pour créer une note."""
    user_id = test_factory.create_user()
    collection_id = test_factory.create_collection(owner_id=user_id)
    return {
        "title": f"Test Note {uuid4().hex[:4]}",
        "content": "Test note content",
        "owner_id": user_id,
        "collection_id": collection_id
    }

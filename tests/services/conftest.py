"""
Configuration des tests pour les services.

Les tests de services utilisent des mocks pour les repositories.
Cela permet de tester uniquement la logique métier des services
sans dépendre de la base de données.
"""
import pytest
from unittest.mock import Mock, MagicMock


# =============================================================================
# FIXTURES POUR MOCKER LES REPOSITORIES
# =============================================================================

@pytest.fixture
def mock_user_repository(monkeypatch):
    """Mock du repository utilisateur."""
    mock = Mock()
    monkeypatch.setattr("repositorys.user_repository", mock)
    # Mock aussi dans les services qui l'utilisent
    monkeypatch.setattr("services.impl.user_service_impl.user_repository", mock)
    monkeypatch.setattr("services.impl.auth_service_impl.user_repository", mock)
    return mock


@pytest.fixture
def mock_collection_repository(monkeypatch):
    """Mock du repository collection."""
    mock = Mock()
    monkeypatch.setattr("repositorys.collection_repository", mock)
    monkeypatch.setattr("services.impl.collection.collection_service_impl.collection_repository", mock)
    return mock


@pytest.fixture
def mock_collection_share_repository(monkeypatch):
    """Mock du repository de partage de collection."""
    mock = Mock()
    monkeypatch.setattr("repositorys.collection_share_repository", mock)
    monkeypatch.setattr("services.impl.collection.collection_share_service_impl.collection_share_repository", mock)
    return mock


@pytest.fixture
def mock_collection_share_link_repository(monkeypatch):
    """Mock du repository de liens publics de collection."""
    mock = Mock()
    monkeypatch.setattr("repositorys.collection_share_link_repository", mock)
    monkeypatch.setattr("services.impl.collection.collection_share_link_service_impl.collection_share_link_repository", mock)
    return mock


@pytest.fixture
def mock_note_repository(monkeypatch):
    """Mock du repository note."""
    mock = Mock()
    monkeypatch.setattr("repositorys.note_repository", mock)
    monkeypatch.setattr("services.impl.note.note_crud_service_impl.note_repository", mock)
    return mock


@pytest.fixture
def mock_note_share_repository(monkeypatch):
    """Mock du repository de partage de note."""
    mock = Mock()
    monkeypatch.setattr("repositorys.note_share_repository", mock)
    monkeypatch.setattr("services.impl.note.note_share_service_impl.note_share_repository", mock)
    return mock


@pytest.fixture
def mock_note_share_link_repository(monkeypatch):
    """Mock du repository de liens publics de note."""
    mock = Mock()
    monkeypatch.setattr("repositorys.note_share_link_repository", mock)
    monkeypatch.setattr("services.impl.note.note_share_link_service_impl.note_share_link_repository", mock)
    return mock


@pytest.fixture
def mock_note_link_repository(monkeypatch):
    """Mock du repository de liens entre notes."""
    mock = Mock()
    monkeypatch.setattr("repositorys.note_link_repository", mock)
    monkeypatch.setattr("services.impl.note.note_link_service_impl.note_link_repository", mock)
    return mock


@pytest.fixture
def mock_flashcard_repository(monkeypatch):
    """Mock du repository flashcard."""
    mock = Mock()
    monkeypatch.setattr("repositorys.flashcard_repository", mock)
    monkeypatch.setattr("services.impl.note.flashcard_service_impl.flashcard_repository", mock)
    return mock


@pytest.fixture
def mock_review_repository(monkeypatch):
    """Mock du repository review."""
    mock = Mock()
    monkeypatch.setattr("repositorys.review_repository", mock)
    monkeypatch.setattr("services.impl.review_service_impl.review_repository", mock)
    return mock


@pytest.fixture
def mock_report_repository(monkeypatch):
    """Mock du repository de signalement."""
    mock = Mock()
    monkeypatch.setattr("repositorys.report_repository", mock)
    monkeypatch.setattr("services.impl.report_service_impl.report_repository", mock)
    return mock


@pytest.fixture
def mock_collection_favorite_repository(monkeypatch):
    """Mock du repository de favoris de collection."""
    mock = Mock()
    monkeypatch.setattr("repositorys.collection_favorite_repository", mock)
    monkeypatch.setattr("services.impl.favorite.collection_favorite_service_impl.collection_favorite_repository", mock)
    return mock


@pytest.fixture
def mock_note_favorite_repository(monkeypatch):
    """Mock du repository de favoris de note."""
    mock = Mock()
    monkeypatch.setattr("repositorys.note_favorite_repository", mock)
    monkeypatch.setattr("services.impl.favorite.note_favorite_service_impl.note_favorite_repository", mock)
    return mock


@pytest.fixture
def mock_user_statistics_repository(monkeypatch):
    """Mock du repository de statistiques utilisateur."""
    mock = Mock()
    monkeypatch.setattr("repositorys.user_statistics_repository", mock)
    monkeypatch.setattr("services.impl.user_statistics_service_impl.user_statistics_repository", mock)
    return mock


@pytest.fixture
def mock_note_image_repository(monkeypatch):
    """Mock du repository d'images de note."""
    mock = Mock()
    monkeypatch.setattr("repositorys.note_image_repository", mock)
    monkeypatch.setattr("services.impl.note.note_image_service_impl.note_image_repository", mock)
    return mock


@pytest.fixture
def mock_permission_repository(monkeypatch):
    """Mock du repository de permissions."""
    mock = Mock()
    monkeypatch.setattr("repositorys.permission_repository", mock)
    return mock


# =============================================================================
# FIXTURES UTILITAIRES
# =============================================================================

@pytest.fixture
def sample_user_id():
    """ID utilisateur de test."""
    return "user-test-123"


@pytest.fixture
def sample_collection_id():
    """ID collection de test."""
    return "collection-test-456"


@pytest.fixture
def sample_note_id():
    """ID note de test."""
    return "note-test-789"

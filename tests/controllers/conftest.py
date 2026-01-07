import pytest
from unittest.mock import Mock, patch


# =============================================================================
# FIXTURES POUR MOCKER LES SERVICES
# =============================================================================

@pytest.fixture
def mock_auth_service(monkeypatch):
    """Mock du service d'authentification."""
    mock = Mock()
    monkeypatch.setattr("controllers.auth_controller.auth_service", mock)
    return mock


@pytest.fixture
def mock_user_service(monkeypatch):
    """Mock du service utilisateur."""
    mock = Mock()
    monkeypatch.setattr("controllers.user_controller.user_service", mock)
    return mock


@pytest.fixture
def mock_collection_service(monkeypatch):
    """Mock du service collection."""
    mock = Mock()
    monkeypatch.setattr("controllers.collection_controller.collection_service", mock)
    return mock


@pytest.fixture
def mock_collection_share_service(monkeypatch):
    """Mock du service de partage de collection."""
    mock = Mock()
    monkeypatch.setattr("controllers.share_collection_controller.collection_share_service", mock)
    return mock


@pytest.fixture
def mock_collection_share_link_service(monkeypatch):
    """Mock du service de liens publics de collection."""
    mock = Mock()
    monkeypatch.setattr("controllers.collection_share_link_controller.collection_share_link_service", mock)
    return mock


@pytest.fixture
def mock_note_crud_service(monkeypatch):
    """Mock du service CRUD de note."""
    mock = Mock()
    monkeypatch.setattr("controllers.note_controller.note_crud_service", mock)
    return mock


@pytest.fixture
def mock_note_share_service(monkeypatch):
    """Mock du service de partage de note."""
    mock = Mock()
    monkeypatch.setattr("controllers.share_note_controller.note_share_service", mock)
    return mock


@pytest.fixture
def mock_note_share_link_service(monkeypatch):
    """Mock du service de liens publics de note."""
    mock = Mock()
    monkeypatch.setattr("controllers.note_share_link_controller.note_share_link_service", mock)
    return mock


@pytest.fixture
def mock_note_link_service(monkeypatch):
    """Mock du service de liens entre notes."""
    mock = Mock()
    monkeypatch.setattr("controllers.note_link_controller.note_link_service", mock)
    return mock


@pytest.fixture
def mock_flashcard_service(monkeypatch):
    """Mock du service flashcard."""
    mock = Mock()
    monkeypatch.setattr("controllers.flashcard_controller.flashcard_service", mock)
    return mock


@pytest.fixture
def mock_review_service(monkeypatch):
    """Mock du service review."""
    mock = Mock()
    monkeypatch.setattr("controllers.review_controller.review_service", mock)
    return mock


@pytest.fixture
def mock_report_service(monkeypatch):
    """Mock du service de signalement."""
    mock = Mock()
    monkeypatch.setattr("controllers.report_controller.report_service", mock)
    return mock


@pytest.fixture
def mock_collection_favorite_service(monkeypatch):
    """Mock du service de favoris de collection."""
    mock = Mock()
    monkeypatch.setattr("controllers.favorite_controller.collection_favorite_service", mock)
    return mock


@pytest.fixture
def mock_note_favorite_service(monkeypatch):
    """Mock du service de favoris de note."""
    mock = Mock()
    monkeypatch.setattr("controllers.favorite_controller.note_favorite_service", mock)
    return mock


@pytest.fixture
def mock_user_statistics_service(monkeypatch):
    """Mock du service de statistiques utilisateur."""
    mock = Mock()
    monkeypatch.setattr("controllers.user_statistics_controller.user_statistics_service", mock)
    return mock


@pytest.fixture
def mock_shared_service(monkeypatch):
    """Mock du service de partage public."""
    mock = Mock()
    monkeypatch.setattr("controllers.shared_controller.shared_service", mock)
    return mock


@pytest.fixture
def mock_note_image_service(monkeypatch):
    """Mock du service d'images de note."""
    mock = Mock()
    monkeypatch.setattr("controllers.note_image_controller.note_image_service", mock)
    return mock


# =============================================================================
# FIXTURES UTILITAIRES
# =============================================================================

@pytest.fixture
def authenticated_client(app_client, monkeypatch):
    """
    Client Flask authentifié avec un utilisateur de test.
    Mock le décorateur @jwt_required pour bypasser l'authentification.
    """
    from flask import g

    # Mock du user_id dans le contexte Flask
    def mock_get_jwt_identity():
        return "test-user-id-123"

    monkeypatch.setattr("flask_jwt_extended.get_jwt_identity", mock_get_jwt_identity)

    # Définit le current_user dans le contexte g
    with app_client.application.app_context():
        g.current_user_id = "test-user-id-123"

    return app_client

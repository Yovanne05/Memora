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
    monkeypatch.setattr("controllers.collection_favorite_controller.collection_favorite_service", mock)
    return mock


@pytest.fixture
def mock_note_favorite_service(monkeypatch):
    """Mock du service de favoris de note."""
    mock = Mock()
    monkeypatch.setattr("controllers.note_favorite_controller.note_favorite_service", mock)
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
def mock_current_user():
    """Mock user for authenticated requests."""
    from daos.user_dao import User
    from utils.enums import RoleEnum
    return User(
        id="test-user-id-123",
        email="test@example.com",
        username="testuser",
        password_hash="hash",
        role=RoleEnum.CLIENT
    )


@pytest.fixture
def authenticated_client(app_client, mock_current_user, monkeypatch):
    """
    Client Flask authentifié avec un utilisateur de test.
    Crée un vrai JWT token et mock get_current_user + permissions.
    """
    from flask_jwt_extended import create_access_token

    # Mock get_current_user everywhere it's imported
    monkeypatch.setattr("utils.auth.get_current_user", lambda: mock_current_user)
    monkeypatch.setattr("utils.permission_decorators.get_current_user", lambda: mock_current_user)

    # Mock permission_domain_service to always allow access
    mock_permission = Mock()
    mock_permission.can_read_note.return_value = True
    mock_permission.can_write_note.return_value = True
    mock_permission.can_manage_note.return_value = True
    mock_permission.can_read_collection.return_value = True
    mock_permission.can_write_collection.return_value = True
    mock_permission.can_manage_collection.return_value = True
    monkeypatch.setattr("utils.permission_decorators.permission_domain_service", mock_permission)

    # Créer un token JWT valide pour les tests
    with app_client.application.app_context():
        access_token = create_access_token(identity="test-user-id-123")

    # Créer un wrapper qui ajoute automatiquement le token aux headers
    class AuthenticatedClient:
        def __init__(self, client, token, user):
            self.client = client
            self.token = token
            self.user = user

        def get(self, *args, **kwargs):
            if 'headers' not in kwargs:
                kwargs['headers'] = {}
            kwargs['headers']['Authorization'] = f'Bearer {self.token}'
            return self.client.get(*args, **kwargs)

        def post(self, *args, **kwargs):
            if 'headers' not in kwargs:
                kwargs['headers'] = {}
            kwargs['headers']['Authorization'] = f'Bearer {self.token}'
            return self.client.post(*args, **kwargs)

        def patch(self, *args, **kwargs):
            if 'headers' not in kwargs:
                kwargs['headers'] = {}
            kwargs['headers']['Authorization'] = f'Bearer {self.token}'
            return self.client.patch(*args, **kwargs)

        def delete(self, *args, **kwargs):
            if 'headers' not in kwargs:
                kwargs['headers'] = {}
            kwargs['headers']['Authorization'] = f'Bearer {self.token}'
            return self.client.delete(*args, **kwargs)

        @property
        def application(self):
            return self.client.application

    return AuthenticatedClient(app_client, access_token, mock_current_user)

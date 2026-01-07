"""
Tests pour le controller d'authentification.

Ces tests vérifient la couche controller (routing, validation HTTP).
Le service auth_service est MOCKÉ.
"""
import pytest
from uuid import uuid4
from http import HTTPStatus


class TestAuthRegister:
    """Tests pour POST /users (register)"""

    def test_register_returns_201(self, app_client, mock_user_service):
        """L'inscription retourne 201 avec l'utilisateur créé."""
        # TODO: Implémenter ce test
        # Migrer depuis tests/auth/test_auth_controller.py::test_register_returns_user
        pass


class TestAuthLogin:
    """Tests pour POST /sessions (login)"""

    def test_login_returns_200_with_token(self, app_client, mock_auth_service):
        """La connexion retourne 200 avec un token JWT."""
        # TODO: Implémenter ce test
        # Migrer depuis tests/auth/test_auth_controller.py
        pass


class TestAuthMe:
    """Tests pour GET /me (current user)"""

    def test_me_returns_current_user(self, authenticated_client, mock_user_service):
        """GET /me retourne l'utilisateur connecté."""
        # TODO: Implémenter ce test
        pass


# TODO: Migrer tous les tests de tests/auth/test_auth_controller.py
# Voir MIGRATION_TESTS.md pour les instructions

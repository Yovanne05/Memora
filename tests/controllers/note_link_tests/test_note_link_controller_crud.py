"""
Tests pour le controller note_link (routing et HTTP).

Ces tests vérifient :
- GET /notes/<id>/relations (liste des liens entre notes)
- POST /notes/<id>/relations (créer un lien entre notes)
- DELETE /notes/<id>/relations/<linked_note_id> (supprimer un lien)

Le service note_link_service est MOCKÉ.
"""
import pytest
from uuid import uuid4
from http import HTTPStatus


class TestNoteLinkControllerCreate:
    """Tests pour POST /notes/<id>/relations"""

    def test_create_note_link_returns_201(self, app_client, mock_note_link_service):
        """Le endpoint POST /notes/<id>/relations retourne 201."""
        from dtos.note_link_dto import NoteLinkDTO
        from datetime import datetime

        # Arrange
        note_id = str(uuid4())
        linked_note_id = str(uuid4())

        link = NoteLinkDTO(
            note_id=note_id,
            linked_note_id=linked_note_id,
            created_at=datetime.now()
        )
        mock_note_link_service.create_link.return_value = link

        payload = {
            "linked_note_id": linked_note_id
        }

        # Act
        response = app_client.post(f"/notes/{note_id}/relations", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["note_id"] == note_id
        assert body["linked_note_id"] == linked_note_id
        mock_note_link_service.create_link.assert_called_once()


class TestNoteLinkControllerDelete:
    """Tests pour DELETE /notes/<id>/relations/<linked_note_id>"""

    def test_delete_note_link_returns_204(self, app_client, mock_note_link_service):
        """Le endpoint DELETE /notes/<id>/relations/<linked_note_id> retourne 204."""
        # Arrange
        note_id = str(uuid4())
        linked_note_id = str(uuid4())
        mock_note_link_service.delete_link.return_value = None

        # Act
        response = app_client.delete(f"/notes/{note_id}/relations/{linked_note_id}")

        # Assert
        assert response.status_code == HTTPStatus.NO_CONTENT
        mock_note_link_service.delete_link.assert_called_once_with(note_id, linked_note_id)

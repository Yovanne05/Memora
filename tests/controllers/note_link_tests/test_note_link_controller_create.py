"""
Tests pour POST /notes/<id>/relations (create link).

Le service note_link_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus


class TestNoteLinkControllerCreate:
    """Tests pour POST /notes/<id>/relations"""

    def test_create_note_link_returns_201(self, authenticated_client, mock_note_link_service):
        """Le endpoint POST /notes/<id>/relations retourne 201."""
        from dtos.note_link_dto import NoteLinkDTO
        from datetime import datetime

        # Arrange
        note_id = str(uuid4())
        linked_note_id = str(uuid4())

        link = NoteLinkDTO(
            note_id=note_id,
            linked_note_id=linked_note_id,
            label="Test Link Label",
            created_at=datetime.now()
        )
        mock_note_link_service.create_link.return_value = link

        payload = {
            "linked_note_id": linked_note_id,
            "label": "Test Link Label"
        }

        # Act
        response = authenticated_client.post(f"/notes/{note_id}/relations", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["note_id"] == note_id
        assert body["linked_note_id"] == linked_note_id
        mock_note_link_service.create_link.assert_called_once()

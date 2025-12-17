"""Tests for GET /notes/{note_id}/images/{filename} endpoint"""


def test_get_nonexistent_image_returns_404(client_with_note_data):
    client, data = client_with_note_data

    response = client.get(f"/notes/{data.note_id}/images/nonexistent.png")

    assert response.status_code == 404

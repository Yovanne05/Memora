"""Tests for DELETE /notes/{note_id}/images/{filename} endpoint"""
from io import BytesIO
from uuid import uuid4


def test_delete_image_returns_no_content(client_with_note_data):
    client, data = client_with_note_data

    image_data = b"fake image"
    upload_response = client.post(
        f"/notes/{data.note_id}",
        data={"image": (BytesIO(image_data), "test.png")},
        content_type="multipart/form-data",
    )
    filename = upload_response.get_json()["file_name"]

    response = client.delete(f"/notes/{data.note_id}/images/{filename}")

    assert response.status_code == 204


def test_delete_nonexistent_image_returns_404(client_with_note_data):
    client, data = client_with_note_data

    response = client.delete(f"/notes/{data.note_id}/images/nonexistent.png")

    assert response.status_code == 404


def test_delete_image_for_nonexistent_note_returns_404(client_with_note_data):
    client, _ = client_with_note_data

    fake_note_id = str(uuid4())

    response = client.delete(f"/notes/{fake_note_id}/images/test.png")

    assert response.status_code == 404

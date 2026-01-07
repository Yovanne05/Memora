"""Tests for POST /users/{user_id}/notes/{note_id}/images endpoint (image upload)"""
from io import BytesIO
from uuid import uuid4


def test_upload_image_without_file_returns_400(client_with_note_data):
    client, data = client_with_note_data

    response = client.post(
        f"/notes/{data.note_id}/attachments",
        data={},
        content_type="multipart/form-data",
    )

    assert response.status_code == 400


def test_upload_image_with_invalid_extension_returns_400(client_with_note_data):
    client, data = client_with_note_data

    image_data = b"fake image"

    response = client.post(
        f"/notes/{data.note_id}/attachments",
        data={
            "image": (BytesIO(image_data), "test.exe"),
        },
        content_type="multipart/form-data",
    )

    assert response.status_code == 400


def test_upload_image_for_nonexistent_note_returns_404(client_with_note_data):
    client, _ = client_with_note_data

    fake_note_id = str(uuid4())
    image_data = b"fake image"

    response = client.post(
        f"/notes/{fake_note_id}/attachments",
        data={"image": (BytesIO(image_data), "test.png")},
        content_type="multipart/form-data",
    )

    assert response.status_code == 404

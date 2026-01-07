"""Tests for GET /notes/{note_id}/attachments/{filename} endpoint (image retrieval)"""
from io import BytesIO
from uuid import uuid4


def test_get_uploaded_image_returns_file(client_with_note_data):
    """Test that an uploaded image can be retrieved"""
    client, data = client_with_note_data

    # Upload an image first
    image_data = b"fake image data"
    upload_response = client.post(
        f"/notes/{data.note_id}/attachments",
        data={"image": (BytesIO(image_data), "test.png")},
        content_type="multipart/form-data",
    )

    assert upload_response.status_code == 201
    body = upload_response.get_json()
    image_url = body["url"]

    # Extract filename from URL (/notes/{note_id}/attachments/{filename})
    # Retrieve the image
    get_response = client.get(image_url)

    assert get_response.status_code == 200
    # The response should be the file itself
    assert get_response.data == image_data


def test_get_nonexistent_image_returns_404(client_with_note_data):
    """Test that requesting a non-existent image returns 404"""
    client, data = client_with_note_data

    response = client.get(f"/notes/{data.note_id}/attachments/nonexistent.png")

    assert response.status_code == 404


def test_get_image_with_wrong_note_id_returns_404(client_with_note_data):
    """Test that requesting an image with wrong note_id returns 404"""
    client, data = client_with_note_data

    # Upload an image
    image_data = b"fake image data"
    upload_response = client.post(
        f"/notes/{data.note_id}/attachments",
        data={"image": (BytesIO(image_data), "test.png")},
        content_type="multipart/form-data",
    )

    assert upload_response.status_code == 201

    # Try to retrieve with wrong note_id
    fake_note_id = str(uuid4())
    response = client.get(f"/notes/{fake_note_id}/attachments/test.png")

    assert response.status_code == 404


def test_get_image_without_authentication(client_with_note_data):
    """Test that image retrieval works without authentication (public endpoint)"""
    client, data = client_with_note_data

    # Upload an image (authenticated)
    image_data = b"fake image data"
    upload_response = client.post(
        f"/notes/{data.note_id}/attachments",
        data={"image": (BytesIO(image_data), "test.png")},
        content_type="multipart/form-data",
    )

    assert upload_response.status_code == 201
    body = upload_response.get_json()
    image_url = body["url"]

    # Clear authorization header to simulate unauthenticated request
    client.environ_base.pop("HTTP_AUTHORIZATION", None)

    # Retrieve the image without authentication
    get_response = client.get(image_url)

    assert get_response.status_code == 200
    assert get_response.data == image_data

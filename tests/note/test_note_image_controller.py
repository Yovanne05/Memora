import os
from io import BytesIO
import pytest
from uuid import uuid4

from tests.note.conftest import NoteTestData


def test_upload_image_returns_created(client_with_note_data):
    client, data = client_with_note_data

    image_data = b"fake image content for testing"

    response = client.post(
        f"/notes/{data.note_id}/images",
        data={"image": (BytesIO(image_data), "test.png")},
        content_type="multipart/form-data",
    )

    assert response.status_code == 201
    json_data = response.get_json()
    assert "filepath" in json_data
    assert "filename" in json_data
    assert json_data["filename"].endswith(".png")


def test_upload_image_without_file_returns_400(client_with_note_data):
    client, data = client_with_note_data

    response = client.post(
        f"/notes/{data.note_id}/images",
        data={},
        content_type="multipart/form-data",
    )

    assert response.status_code == 400
    json_data = response.get_json()
    assert "error" in json_data


def test_upload_image_with_invalid_extension_returns_400(client_with_note_data):
    client, data = client_with_note_data

    image_data = b"fake image"

    response = client.post(
        f"/notes/{data.note_id}/images",
        data={"image": (BytesIO(image_data), "test.exe")},
        content_type="multipart/form-data",
    )

    assert response.status_code == 400
    json_data = response.get_json()
    assert "error" in json_data
    assert "non autorisé" in json_data["error"].lower()


def test_upload_image_for_nonexistent_note_returns_404(client_with_note_data):
    client, data = client_with_note_data

    fake_note_id = str(uuid4())
    image_data = b"fake image"

    response = client.post(
        f"/notes/{fake_note_id}/images",
        data={"image": (BytesIO(image_data), "test.png")},
        content_type="multipart/form-data",
    )

    assert response.status_code == 404


def test_get_image_returns_file(client_with_note_data):
    client, data = client_with_note_data

    image_data = b"fake image content"
    upload_response = client.post(
        f"/notes/{data.note_id}/images",
        data={"image": (BytesIO(image_data), "test.png")},
        content_type="multipart/form-data",
    )
    filename = upload_response.get_json()["filename"]

    response = client.get(f"/notes/{data.note_id}/images/{filename}")

    assert response.status_code == 200
    assert response.data == image_data


def test_get_nonexistent_image_returns_404(client_with_note_data):
    client, data = client_with_note_data

    response = client.get(f"/notes/{data.note_id}/images/nonexistent.png")

    assert response.status_code == 404


def test_delete_image_returns_no_content(client_with_note_data):
    client, data = client_with_note_data

    image_data = b"fake image"
    upload_response = client.post(
        f"/notes/{data.note_id}/images",
        data={"image": (BytesIO(image_data), "test.png")},
        content_type="multipart/form-data",
    )
    filename = upload_response.get_json()["filename"]

    response = client.delete(f"/notes/{data.note_id}/images/{filename}")

    assert response.status_code == 204


def test_delete_image_removes_from_note(client_with_note_data):
    client, data = client_with_note_data

    image_data = b"fake image"
    upload_response = client.post(
        f"/notes/{data.note_id}/images",
        data={"image": (BytesIO(image_data), "test.png")},
        content_type="multipart/form-data",
    )
    filename = upload_response.get_json()["filename"]

    note = client.get(f"/notes/{data.note_id}").get_json()
    assert len(note["images"]) == 1

    client.delete(f"/notes/{data.note_id}/images/{filename}")

    note_after = client.get(f"/notes/{data.note_id}").get_json()
    assert len(note_after["images"]) == 0


def test_delete_nonexistent_image_returns_404(client_with_note_data):
    client, data = client_with_note_data

    response = client.delete(f"/notes/{data.note_id}/images/nonexistent.png")

    assert response.status_code == 404


def test_delete_image_for_nonexistent_note_returns_404(client_with_note_data):
    client, data = client_with_note_data

    fake_note_id = str(uuid4())

    response = client.delete(f"/notes/{fake_note_id}/images/test.png")

    assert response.status_code == 404


def test_upload_multiple_images(client_with_note_data):
    client, data = client_with_note_data

    for i in range(3):
        image_data = f"image {i}".encode()
        response = client.post(
            f"/notes/{data.note_id}/images",
            data={"image": (BytesIO(image_data), f"test{i}.png")},
            content_type="multipart/form-data",
        )
        assert response.status_code == 201

    note = client.get(f"/notes/{data.note_id}").get_json()
    assert len(note["images"]) == 3

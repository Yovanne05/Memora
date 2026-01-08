"""Tests for flashcard permissions (READ/WRITE/OWNER)"""
from utils.enums import SharePermissionEnum


def test_user_with_read_cannot_create_flashcard(client_with_note_data):
    """User with READ permission should not be able to create flashcards"""
    client, data = client_with_note_data

    # Share note with READ permission
    share_user_id = data.create_user("reader")
    client.post(
        f"/notes/{data.note_id}/shares",
        json={
            "user_id": share_user_id,
            "permission": SharePermissionEnum.READ.value,
        },
    )

    # Authenticate as the reader
    data._authenticate_client(share_user_id)

    # Try to create flashcard
    payload = {
        "question": "Test question?",
        "answers": [{"answer_text": "Test answer", "is_correct": True}],
    }
    response = client.post(f"/notes/{data.note_id}/flashcards", json=payload)

    assert response.status_code == 500  # Permission denied


def test_user_with_read_cannot_update_flashcard(client_with_note_data):
    """User with READ permission should not be able to update flashcards"""
    client, data = client_with_note_data

    # Create flashcard as owner
    payload = {
        "question": "Original question?",
        "answers": [{"answer_text": "Original answer", "is_correct": True}],
    }
    create_response = client.post(f"/notes/{data.note_id}/flashcards", json=payload)
    flashcard_id = create_response.get_json()["id"]

    # Share note with READ permission
    share_user_id = data.create_user("reader")
    client.post(
        f"/notes/{data.note_id}/shares",
        json={
            "user_id": share_user_id,
            "permission": SharePermissionEnum.READ.value,
        },
    )

    # Authenticate as the reader
    data._authenticate_client(share_user_id)

    # Try to update flashcard
    update_payload = {"question": "Modified question?"}
    response = client.patch(f"/flashcards/{flashcard_id}", json=update_payload)

    assert response.status_code == 404  # Flashcard not found (permission denied)


def test_user_with_read_cannot_delete_flashcard(client_with_note_data):
    """User with READ permission should not be able to delete flashcards"""
    client, data = client_with_note_data

    # Create flashcard as owner
    payload = {
        "question": "Test question?",
        "answers": [{"answer_text": "Test answer", "is_correct": True}],
    }
    create_response = client.post(f"/notes/{data.note_id}/flashcards", json=payload)
    flashcard_id = create_response.get_json()["id"]

    # Share note with READ permission
    share_user_id = data.create_user("reader")
    client.post(
        f"/notes/{data.note_id}/shares",
        json={
            "user_id": share_user_id,
            "permission": SharePermissionEnum.READ.value,
        },
    )

    # Authenticate as the reader
    data._authenticate_client(share_user_id)

    # Try to delete flashcard
    response = client.delete(f"/flashcards/{flashcard_id}")

    assert response.status_code == 404  # Flashcard not found (permission denied)


def test_user_with_write_can_create_flashcard(client_with_note_data):
    """User with WRITE permission should be able to create flashcards"""
    client, data = client_with_note_data

    # Share note with WRITE permission
    share_user_id = data.create_user("writer")
    client.post(
        f"/notes/{data.note_id}/shares",
        json={
            "user_id": share_user_id,
            "permission": SharePermissionEnum.WRITE.value,
        },
    )

    # Authenticate as the writer
    data._authenticate_client(share_user_id)

    # Create flashcard
    payload = {
        "question": "Writer's question?",
        "answers": [{"answer_text": "Writer's answer", "is_correct": True}],
    }
    response = client.post(f"/notes/{data.note_id}/flashcards", json=payload)

    assert response.status_code == 201
    body = response.get_json()
    assert body["question"] == "Writer's question?"


def test_user_with_write_can_update_flashcard(client_with_note_data):
    """User with WRITE permission should be able to update flashcards"""
    client, data = client_with_note_data

    # Create flashcard as owner
    payload = {
        "question": "Original question?",
        "answers": [{"answer_text": "Original answer", "is_correct": True}],
    }
    create_response = client.post(f"/notes/{data.note_id}/flashcards", json=payload)
    flashcard_id = create_response.get_json()["id"]

    # Share note with WRITE permission
    share_user_id = data.create_user("writer")
    client.post(
        f"/notes/{data.note_id}/shares",
        json={
            "user_id": share_user_id,
            "permission": SharePermissionEnum.WRITE.value,
        },
    )

    # Authenticate as the writer
    data._authenticate_client(share_user_id)

    # Update flashcard
    update_payload = {"question": "Updated by writer?"}
    response = client.patch(f"/flashcards/{flashcard_id}", json=update_payload)

    assert response.status_code == 200
    body = response.get_json()
    assert body["question"] == "Updated by writer?"


def test_user_with_write_cannot_delete_flashcard(client_with_note_data):
    """User with WRITE permission should NOT be able to delete flashcards"""
    client, data = client_with_note_data

    # Create flashcard as owner
    payload = {
        "question": "Test question?",
        "answers": [{"answer_text": "Test answer", "is_correct": True}],
    }
    create_response = client.post(f"/notes/{data.note_id}/flashcards", json=payload)
    flashcard_id = create_response.get_json()["id"]

    # Share note with WRITE permission
    share_user_id = data.create_user("writer")
    client.post(
        f"/notes/{data.note_id}/shares",
        json={
            "user_id": share_user_id,
            "permission": SharePermissionEnum.WRITE.value,
        },
    )

    # Authenticate as the writer
    data._authenticate_client(share_user_id)

    # Try to delete flashcard
    response = client.delete(f"/flashcards/{flashcard_id}")

    assert response.status_code == 404  # Flashcard not found (permission denied)


def test_user_with_owner_can_create_flashcard(client_with_note_data):
    """User with OWNER permission should be able to create flashcards"""
    client, data = client_with_note_data

    # Share note with OWNER permission
    share_user_id = data.create_user("co-owner")
    client.post(
        f"/notes/{data.note_id}/shares",
        json={
            "user_id": share_user_id,
            "permission": SharePermissionEnum.OWNER.value,
        },
    )

    # Authenticate as the co-owner
    data._authenticate_client(share_user_id)

    # Create flashcard
    payload = {
        "question": "Owner's question?",
        "answers": [{"answer_text": "Owner's answer", "is_correct": True}],
    }
    response = client.post(f"/notes/{data.note_id}/flashcards", json=payload)

    assert response.status_code == 201
    body = response.get_json()
    assert body["question"] == "Owner's question?"


def test_user_with_owner_can_update_flashcard(client_with_note_data):
    """User with OWNER permission should be able to update flashcards"""
    client, data = client_with_note_data

    # Create flashcard as owner
    payload = {
        "question": "Original question?",
        "answers": [{"answer_text": "Original answer", "is_correct": True}],
    }
    create_response = client.post(f"/notes/{data.note_id}/flashcards", json=payload)
    flashcard_id = create_response.get_json()["id"]

    # Share note with OWNER permission
    share_user_id = data.create_user("co-owner")
    client.post(
        f"/notes/{data.note_id}/shares",
        json={
            "user_id": share_user_id,
            "permission": SharePermissionEnum.OWNER.value,
        },
    )

    # Authenticate as the co-owner
    data._authenticate_client(share_user_id)

    # Update flashcard
    update_payload = {"question": "Updated by co-owner?"}
    response = client.patch(f"/flashcards/{flashcard_id}", json=update_payload)

    assert response.status_code == 200
    body = response.get_json()
    assert body["question"] == "Updated by co-owner?"


def test_user_with_owner_can_delete_flashcard(client_with_note_data):
    """User with OWNER permission should be able to delete flashcards"""
    client, data = client_with_note_data

    # Create flashcard as owner
    payload = {
        "question": "Test question?",
        "answers": [{"answer_text": "Test answer", "is_correct": True}],
    }
    create_response = client.post(f"/notes/{data.note_id}/flashcards", json=payload)
    flashcard_id = create_response.get_json()["id"]

    # Share note with OWNER permission
    share_user_id = data.create_user("co-owner")
    client.post(
        f"/notes/{data.note_id}/shares",
        json={
            "user_id": share_user_id,
            "permission": SharePermissionEnum.OWNER.value,
        },
    )

    # Authenticate as the co-owner
    data._authenticate_client(share_user_id)

    # Delete flashcard
    response = client.delete(f"/flashcards/{flashcard_id}")

    assert response.status_code == 204


def test_user_with_write_can_duplicate_flashcard(client_with_note_data):
    """User with WRITE permission should be able to duplicate flashcards"""
    client, data = client_with_note_data

    # Create flashcard as owner
    payload = {
        "question": "Original question?",
        "answers": [{"answer_text": "Original answer", "is_correct": True}],
    }
    create_response = client.post(f"/notes/{data.note_id}/flashcards", json=payload)
    flashcard_id = create_response.get_json()["id"]

    # Share note with WRITE permission
    share_user_id = data.create_user("writer")
    client.post(
        f"/notes/{data.note_id}/shares",
        json={
            "user_id": share_user_id,
            "permission": SharePermissionEnum.WRITE.value,
        },
    )

    # Authenticate as the writer
    data._authenticate_client(share_user_id)

    # Duplicate flashcard
    response = client.post(f"/flashcards/{flashcard_id}/duplicates")

    assert response.status_code == 201
    body = response.get_json()
    assert body["question"] == "Original question?"
    assert body["id"] != flashcard_id  # New ID


def test_user_with_read_cannot_duplicate_flashcard(client_with_note_data):
    """User with READ permission should NOT be able to duplicate flashcards"""
    client, data = client_with_note_data

    # Create flashcard as owner
    payload = {
        "question": "Original question?",
        "answers": [{"answer_text": "Original answer", "is_correct": True}],
    }
    create_response = client.post(f"/notes/{data.note_id}/flashcards", json=payload)
    flashcard_id = create_response.get_json()["id"]

    # Share note with READ permission
    share_user_id = data.create_user("reader")
    client.post(
        f"/notes/{data.note_id}/shares",
        json={
            "user_id": share_user_id,
            "permission": SharePermissionEnum.READ.value,
        },
    )

    # Authenticate as the reader
    data._authenticate_client(share_user_id)

    # Try to duplicate flashcard
    response = client.post(f"/flashcards/{flashcard_id}/duplicates")

    assert response.status_code == 404  # Flashcard not found (permission denied)

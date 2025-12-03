from uuid import uuid4

from utils.enums import VisibilityEnum


def test_find_many_returns_notes(client_with_note_data):
    client, data = client_with_note_data
    query = {"ownerId": data.owner_id, "titleContains": data.search_term}

    response = client.get("/notes", query_string=query)

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total"] == 1
    assert payload["items"][0]["id"] == data.note_id


def test_find_one_returns_single_note(client_with_note_data):
    client, data = client_with_note_data

    response = client.get(f"/notes/{data.note_id}")

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["id"] == data.note_id


def test_find_one_returns_404_when_note_missing(client_with_note_data):
    client, _ = client_with_note_data

    response = client.get(f"/notes/{uuid4()}")

    assert response.status_code == 404

'''
def test_find_many_filters_by_tags_and_shared_user(client_with_note_data):
    client, data = client_with_note_data
    data.ensure_share()
    first_tag = data.create_tag()
    second_tag = data.create_tag()
    data.replace_tags([first_tag, second_tag])
    data.replace_tags([first_tag], note_id=data.linked_note_id)

    query = {
        "sharedWithUserId": data.share_user_id,
        "tagIds": f"{first_tag},{second_tag}",
    }

    response = client.get("/notes", query_string=query)

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total"] == 1
    assert payload["items"][0]["id"] == data.note_id
'''

def test_create_note_returns_created_note(client_with_note_data):
    client, data = client_with_note_data
    title = f"New title {uuid4()}"
    payload = {
        "title": title,
        "content": "New content",
        "owner_id": data.owner_id,
        "collection_id": data.collection_id,
        "visibility": VisibilityEnum.PUBLIC.value,
    }

    response = client.post("/notes", json=payload)

    assert response.status_code == 201
    body = response.get_json()
    assert body["title"] == title
    assert body["owner_id"] == data.owner_id
    data.track_created_note(body["id"])


def test_create_note_requires_existing_owner(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "title": f"Missing owner note {uuid4().hex[:8]}",
        "content": "Content for missing owner",
        "owner_id": str(uuid4()),
        "collection_id": data.collection_id,
        "visibility": VisibilityEnum.PRIVATE.value,
    }

    response = client.post("/notes", json=payload)

    assert response.status_code == 422


def test_create_note_conflict_on_duplicate_title(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "title": data.base_title,
        "content": "Duplicate content",
        "owner_id": data.owner_id,
        "collection_id": data.collection_id,
        "visibility": VisibilityEnum.PRIVATE.value,
    }

    response = client.post("/notes", json=payload)

    assert response.status_code == 409


def test_create_note_rejects_foreign_collection(client_with_note_data):
    client, data = client_with_note_data
    foreign_owner_id = data.create_user("foreign-owner")
    foreign_collection_id = data.create_collection(
        owner_id=foreign_owner_id, name=f"Foreign collection {uuid4().hex[:6]}"
    )
    payload = {
        "title": f"Foreign collection note {uuid4().hex[:8]}",
        "content": "Should not be allowed",
        "owner_id": data.owner_id,
        "collection_id": foreign_collection_id,
        "visibility": VisibilityEnum.PRIVATE.value,
    }

    response = client.post("/notes", json=payload)

    assert response.status_code == 422


def test_update_note_returns_updated_note(client_with_note_data):
    client, data = client_with_note_data
    payload = {
        "title": "Updated title",
        "content": "Updated content",
        "visibility": VisibilityEnum.PUBLIC.value,
    }

    response = client.patch(f"/notes/{data.note_id}", json=payload)

    assert response.status_code == 200
    body = response.get_json()
    assert body["title"] == "Updated title"
    assert body["content"] == "Updated content"


def test_update_note_conflict_when_title_exists(client_with_note_data):
    client, data = client_with_note_data
    other_title = f"Existing title {uuid4().hex[:8]}"
    data.create_note(
        title=other_title,
        content="Existing content",
        collection_id=data.collection_id,
    )
    payload = {
        "title": other_title,
        "content": "New content",
    }

    response = client.patch(f"/notes/{data.note_id}", json=payload)

    assert response.status_code == 409


def test_update_note_rejects_collection_change_when_linked(client_with_note_data):
    client, data = client_with_note_data
    data.ensure_link()
    new_collection_id = data.create_collection(
        name=f"New collection {uuid4().hex[:6]}"
    )
    payload = {"collection_id": new_collection_id}

    response = client.patch(f"/notes/{data.note_id}", json=payload)

    assert response.status_code == 422


def test_update_note_returns_404_when_missing(client_with_note_data):
    client, _ = client_with_note_data
    payload = {"title": "Will not be found"}

    response = client.patch(f"/notes/{uuid4()}", json=payload)

    assert response.status_code == 404


def test_delete_note_calls_service(client_with_note_data):
    client, data = client_with_note_data

    response = client.delete(f"/notes/{data.note_id}")

    assert response.status_code == 204


def test_delete_note_returns_404_when_missing(client_with_note_data):
    client, _ = client_with_note_data

    response = client.delete(f"/notes/{uuid4()}")

    assert response.status_code == 404

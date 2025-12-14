from uuid import uuid4


def test_list_links_returns_items(client_with_note_data):
    client, data = client_with_note_data
    data.ensure_link()

    response = client.get(f"/notes/{data.note_id}/links")

    assert response.status_code == 200
    payload = response.get_json()
    assert len(payload) == 1
    assert payload[0]["linked_note_id"] == data.linked_note_id
    assert payload[0]["note_id"] == data.note_id


def test_create_link_returns_created_link(client_with_note_data):
    client, data = client_with_note_data
    payload = {"linked_note_id": data.linked_note_id}

    response = client.post(
        f"/notes/{data.note_id}/links",
        json=payload,
    )

    assert response.status_code == 201
    body = response.get_json()
    assert body["note_id"] == data.note_id
    assert body["linked_note_id"] == data.linked_note_id
    data.track_created_link(data.note_id, data.linked_note_id)


def test_delete_link_calls_service(client_with_note_data):
    client, data = client_with_note_data
    data.ensure_link()

    response = client.delete(
        f"/notes/{data.note_id}/links/{data.linked_note_id}"
    )

    assert response.status_code == 204


def test_create_link_rejects_self_reference(client_with_note_data):
    client, data = client_with_note_data
    payload = {"linked_note_id": data.note_id}

    response = client.post(f"/notes/{data.note_id}/links", json=payload)

    assert response.status_code == 422


def test_create_link_requires_existing_target(client_with_note_data):
    client, data = client_with_note_data
    payload = {"linked_note_id": str(uuid4())}

    response = client.post(f"/notes/{data.note_id}/links", json=payload)

    assert response.status_code == 404


def test_create_link_requires_same_collection(client_with_note_data):
    client, data = client_with_note_data
    other_collection_id = data.create_collection(
        name=f"Second collection {uuid4().hex[:6]}"
    )
    other_note_id = data.create_note(
        title=f"Other note {uuid4().hex[:6]}",
        content="Other note content",
        collection_id=other_collection_id,
    )
    payload = {"linked_note_id": other_note_id}

    response = client.post(f"/notes/{data.note_id}/links", json=payload)

    assert response.status_code == 422


def test_delete_link_returns_404_when_missing(client_with_note_data):
    client, data = client_with_note_data

    response = client.delete(
        f"/notes/{data.note_id}/links/{uuid4()}"
    )

    assert response.status_code == 404


def test_list_links_returns_404_for_unknown_note(client_with_note_data):
    client, _ = client_with_note_data

    response = client.get(f"/notes/{uuid4()}/links")

    assert response.status_code == 404

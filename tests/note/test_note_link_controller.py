def test_list_links_returns_items(client_with_note_data):
    client, data = client_with_note_data
    data.ensure_link()

    response = client.get(f"/notes/{data.note_id}/links")

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total"] == 1
    assert payload["items"][0]["linked_note_id"] == data.linked_note_id
    assert payload["items"][0]["note_id"] == data.note_id


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

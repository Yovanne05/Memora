from uuid import uuid4


def test_list_tags_returns_empty_when_no_tags(client_with_note_data):
    client, data = client_with_note_data

    response = client.get(f"/notes/{data.note_id}/tags")

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total"] == 0
    assert payload["items"] == []


def test_replace_tags_adds_tags(client_with_note_data):
    client, data = client_with_note_data
    first_tag = data.create_tag()
    second_tag = data.create_tag()

    response = client.put(
        f"/notes/{data.note_id}/tags",
        json={"tagIds": [first_tag, second_tag]},
    )

    assert response.status_code == 200
    payload = response.get_json()
    returned_ids = {item["id"] for item in payload["items"]}
    assert payload["total"] == 2
    assert returned_ids == {first_tag, second_tag}


def test_replace_tags_overwrites_previous_links(client_with_note_data):
    client, data = client_with_note_data
    first_tag = data.create_tag()
    second_tag = data.create_tag()
    client.put(
        f"/notes/{data.note_id}/tags",
        json={"tagIds": [first_tag, second_tag]},
    )
    replacement_tag = data.create_tag()

    response = client.put(
        f"/notes/{data.note_id}/tags",
        json={"tagIds": [replacement_tag]},
    )

    assert response.status_code == 200
    payload = response.get_json()
    returned_ids = {item["id"] for item in payload["items"]}
    assert payload["total"] == 1
    assert returned_ids == {replacement_tag}


def test_replace_tags_deduplicates_ids(client_with_note_data):
    client, data = client_with_note_data
    tag_id = data.create_tag()

    response = client.put(
        f"/notes/{data.note_id}/tags",
        json={"tagIds": [tag_id, tag_id]},
    )

    assert response.status_code == 200
    payload = response.get_json()
    returned_ids = {item["id"] for item in payload["items"]}
    assert payload["total"] == 1
    assert returned_ids == {tag_id}


def test_replace_tags_can_clear_links(client_with_note_data):
    client, data = client_with_note_data
    tag_id = data.create_tag()
    client.put(
        f"/notes/{data.note_id}/tags",
        json={"tagIds": [tag_id]},
    )

    response = client.put(
        f"/notes/{data.note_id}/tags",
        json={"tagIds": []},
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total"] == 0
    assert payload["items"] == []


def test_replace_tags_returns_404_when_note_missing(client_with_note_data):
    client, data = client_with_note_data
    tag_id = data.create_tag()

    response = client.put(
        f"/notes/{uuid4()}/tags",
        json={"tagIds": [tag_id]},
    )

    assert response.status_code == 404


def test_replace_tags_returns_404_when_tag_missing(client_with_note_data):
    client, data = client_with_note_data

    response = client.put(
        f"/notes/{data.note_id}/tags",
        json={"tagIds": [str(uuid4())]},
    )

    assert response.status_code == 404


def test_list_tags_returns_404_for_unknown_note(client_with_note_data):
    client, _ = client_with_note_data

    response = client.get(f"/notes/{uuid4()}/tags")

    assert response.status_code == 404

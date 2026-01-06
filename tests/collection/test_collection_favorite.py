"""Tests for favorite collection endpoints and flags."""


def test_collection_favorite_flag_and_filter(client_with_note_data):
    client, data = client_with_note_data

    # initial state
    initial = client.get(f"/collections/{data.collection_id}")
    assert initial.status_code == 200
    assert initial.get_json()["is_favorite"] is False

    add_resp = client.post(f"/collections/{data.collection_id}/favorites")
    assert add_resp.status_code in (200, 201)

    detail = client.get(f"/collections/{data.collection_id}")
    assert detail.status_code == 200
    assert detail.get_json()["is_favorite"] is True

    list_resp = client.get("/collections", query_string={"isFavorite": True})
    assert list_resp.status_code == 200
    payload = list_resp.get_json()
    assert payload["total"] >= 1
    ids = [item["id"] for item in payload["items"]]
    assert data.collection_id in ids

    del_resp = client.delete(f"/collections/{data.collection_id}/favorites")
    assert del_resp.status_code == 204

    filtered_after = client.get("/collections", query_string={"isFavorite": True})
    assert filtered_after.status_code == 200
    assert data.collection_id not in [item["id"] for item in filtered_after.get_json()["items"]]


def test_remove_collection_favorite_returns_404_when_not_favorited(client_with_note_data):
    client, data = client_with_note_data

    response = client.delete(f"/collections/{data.collection_id}/favorites")

    assert response.status_code == 404
pytest_plugins = ["tests.note.conftest"]

import pytest

"""Tests for favorite note endpoints and flags."""


def test_favorite_flag_and_filter(client_with_note_data):
    client, data = client_with_note_data

    add_resp = client.post(f"/notes/{data.note_id}/favorites")
    assert add_resp.status_code in (200, 201)

    detail = client.get(f"/notes/{data.note_id}")
    assert detail.status_code == 200
    assert detail.get_json()["is_favorite"] is True

    list_resp = client.get("/notes", query_string={"isFavorite": True})
    assert list_resp.status_code == 200
    payload = list_resp.get_json()
    assert payload["total"] == 1
    assert payload["items"][0]["id"] == data.note_id
    assert payload["items"][0]["is_favorite"] is True

    del_resp = client.delete(f"/notes/{data.note_id}/favorites")
    assert del_resp.status_code == 204

    filtered_after = client.get("/notes", query_string={"isFavorite": True})
    assert filtered_after.status_code == 200
    assert filtered_after.get_json()["total"] == 0


def test_remove_favorite_returns_404_when_not_favorited(client_with_note_data):
    client, data = client_with_note_data

    response = client.delete(f"/notes/{data.note_id}/favorites")

    assert response.status_code == 404

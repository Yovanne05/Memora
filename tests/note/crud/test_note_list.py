"""Tests for GET /notes endpoint"""


def test_find_many_returns_notes(client_with_note_data):
    client, data = client_with_note_data
    query = {"ownerId": data.owner_id, "titleContains": data.search_term}

    response = client.get("/notes", query_string=query)

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total"] == 1
    assert payload["items"][0]["id"] == data.note_id

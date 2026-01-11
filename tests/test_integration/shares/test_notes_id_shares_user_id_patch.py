from http import HTTPStatus
from uuid import uuid4


def test_notes_shares_update_success(app_client, owner_context, other_user) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]
    target_user_id = other_user["user"]["id"]

    create_response = app_client.post(
        f"/notes/{note_id}/shares",
        json = {"user_id" : target_user_id, "permission" : "read"},
        headers = headers,
    )
    assert create_response.status_code == HTTPStatus.CREATED

    response = app_client.patch(
        f"/notes/{note_id}/shares/{target_user_id}",
        json = {"permission" : "write"},
        headers = headers,
    )

    assert response.status_code == HTTPStatus.OK
    assert response.get_json()["permission"] == "write"


def test_notes_shares_update_missing_returns_404(app_client, owner_context) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    response = app_client.patch(
        f"/notes/{note_id}/shares/{uuid4()}",
        json = {"permission" : "write"},
        headers = headers,
    )

    assert response.status_code == HTTPStatus.NOT_FOUND

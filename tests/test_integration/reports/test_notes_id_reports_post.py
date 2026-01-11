from http import HTTPStatus


def test_notes_reports_create_success(app_client, owner_context) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    response = app_client.post(
        f"/notes/{note_id}/reports",
        json = {"reason" : "spam_or_abuse"},
        headers = headers,
    )

    assert response.status_code == HTTPStatus.CREATED

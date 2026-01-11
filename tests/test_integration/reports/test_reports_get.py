from http import HTTPStatus


def test_reports_list_includes_created(app_client, owner_context, admin_context) :
    user_headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    report_response = app_client.post(
        f"/notes/{note_id}/reports",
        json = {"reason" : "spam_or_abuse"},
        headers = user_headers,
    )
    assert report_response.status_code == HTTPStatus.CREATED
    report = report_response.get_json()

    admin_headers = admin_context["headers"]
    response = app_client.get("/reports", headers = admin_headers)

    assert response.status_code == HTTPStatus.OK
    body = response.get_json()
    assert any(item["id"] == report["id"] for item in body["items"])


def test_reports_list_requires_admin(app_client, owner_context) :
    headers = owner_context["headers"]

    response = app_client.get("/reports", headers = headers)

    assert response.status_code == HTTPStatus.FORBIDDEN

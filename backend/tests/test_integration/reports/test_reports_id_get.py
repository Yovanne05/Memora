from http import HTTPStatus


def test_reports_get_success(app_client, owner_context, admin_context) :
    user_headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    report_response = app_client.post(
        f"/notes/{note_id}/reports",
        json = {"reason" : "spam_or_abuse"},
        headers = user_headers,
    )
    assert report_response.status_code == HTTPStatus.CREATED
    report_id = report_response.get_json()["id"]

    admin_headers = admin_context["headers"]
    response = app_client.get(f"/reports/{report_id}", headers = admin_headers)

    assert response.status_code == HTTPStatus.OK
    assert response.get_json()["id"] == report_id


def test_reports_get_missing_returns_404_for_admin(app_client, admin_context) :
    headers = admin_context["headers"]

    response = app_client.get(
        "/reports/00000000-0000-0000-0000-000000000000", headers = headers
    )

    assert response.status_code == HTTPStatus.NOT_FOUND

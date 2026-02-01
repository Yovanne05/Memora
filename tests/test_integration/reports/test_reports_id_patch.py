from http import HTTPStatus


def test_reports_update_success(app_client, owner_context, admin_context) :
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
    response = app_client.patch(
        f"/reports/{report_id}",
        json = {"status" : "resolved"},
        headers = admin_headers,
    )

    assert response.status_code == HTTPStatus.OK
    assert response.get_json()["status"] == "resolved"


def test_reports_update_rejects_non_admin(app_client, owner_context) :
    headers = owner_context["headers"]
    note_id = owner_context["note"]["id"]

    report_response = app_client.post(
        f"/notes/{note_id}/reports",
        json = {"reason" : "spam_or_abuse"},
        headers = headers,
    )
    assert report_response.status_code == HTTPStatus.CREATED
    report_id = report_response.get_json()["id"]

    response = app_client.patch(
        f"/reports/{report_id}",
        json = {"status" : "resolved"},
        headers = headers,
    )

    assert response.status_code == HTTPStatus.FORBIDDEN

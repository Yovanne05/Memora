from uuid import uuid4

from utils.enums import (
    ReportReasonEnum,
    ReportStatusEnum,
    RoleEnum,
    VisibilityEnum,
)
from utils.db import get_db_session
from daos.user_dao import User


def _create_user(client, role: RoleEnum = RoleEnum.CLIENT):
    slug = uuid4().hex[:8]
    password = f"Pwd-{slug}-1!"  # NOSONAR
    payload = {
        "email": f"user-{slug}@example.com",
        "password": password,
        "username": f"user-{slug}",
        "display_name": f"User {slug}",
    }
    response = client.post("/users", json=payload)
    assert response.status_code == 201, response.get_data(as_text=True)
    body = response.get_json()
    user_id = body["id"]

    # Update role directly in database if not CLIENT
    if role != RoleEnum.CLIENT:
        with get_db_session() as session:
            user = session.query(User).filter(User.id == user_id).one()
            user.role = role
            session.commit()

    return {"id": user_id, "email": payload["email"], "password": password}


def _login(client, email: str, password: str) -> str:
    response = client.post(
        "/sessions",
        json={"identifier": email, "password": password},  # NOSONAR
    )
    assert response.status_code == 200, response.get_data(as_text=True)
    token = response.get_json()["access_token"]
    client.environ_base["HTTP_AUTHORIZATION"] = f"Bearer {token}"
    return token


def _create_collection(client, owner_id: str) -> str:
    payload = {
        "name": f"Coll-{uuid4().hex[:6]}",
        "description": "Test collection",
        "owner_id": owner_id,
        "visibility": VisibilityEnum.PRIVATE.value,
        "tags": [],
    }
    response = client.post("/collections", json=payload)
    assert response.status_code == 201, response.get_data(as_text=True)
    return response.get_json()["id"]


def _create_note(client, owner_id: str, collection_id: str) -> str:
    payload = {
        "title": f"Note-{uuid4().hex[:6]}",
        "content": "Report target content",
        "owner_id": owner_id,
        "collection_id": collection_id,
        "visibility": VisibilityEnum.PRIVATE.value,
        "tags": [],
    }
    response = client.post("/notes", json=payload)
    assert response.status_code == 201, response.get_data(as_text=True)
    return response.get_json()["id"]


def _create_report(client, note_id: str, reason: ReportReasonEnum):
    response = client.post(
        f"/notes/{note_id}/reports",
        json={
            "reason": reason.value,
            "description": "Suspicious content",
        },
    )
    assert response.status_code == 201, response.get_data(as_text=True)
    return response.get_json()


def test_report_note_and_list_as_admin(app_client):
    # Owner creates a note and reports it
    owner = _create_user(app_client, role=RoleEnum.CLIENT)
    _login(app_client, owner["email"], owner["password"])
    collection_id = _create_collection(app_client, owner["id"])
    note_id = _create_note(app_client, owner["id"], collection_id)
    report = _create_report(app_client, note_id, ReportReasonEnum.SPAM_OR_ABUSE)

    # Admin lists reports
    admin = _create_user(app_client, role=RoleEnum.ADMIN)
    _login(app_client, admin["email"], admin["password"])
    response = app_client.get("/reports")

    assert response.status_code == 200
    body = response.get_json()
    assert body["total"] == 1
    assert body["items"][0]["id"] == report["id"]
    assert body["items"][0]["targetType"] == "note"
    assert body["items"][0]["noteId"] == note_id
    assert body["items"][0]["reporterId"] == owner["id"]


def test_report_list_forbidden_for_non_admin(app_client):
    owner = _create_user(app_client, role=RoleEnum.CLIENT)
    _login(app_client, owner["email"], owner["password"])
    collection_id = _create_collection(app_client, owner["id"])
    note_id = _create_note(app_client, owner["id"], collection_id)
    _create_report(app_client, note_id, ReportReasonEnum.ILLEGAL_CONTENT)

    response = app_client.get("/reports")

    assert response.status_code == 403


def test_admin_updates_status(app_client):
    owner = _create_user(app_client, role=RoleEnum.CLIENT)
    _login(app_client, owner["email"], owner["password"])
    collection_id = _create_collection(app_client, owner["id"])
    note_id = _create_note(app_client, owner["id"], collection_id)
    report = _create_report(app_client, note_id, ReportReasonEnum.TECHNICAL_ISSUE)

    admin = _create_user(app_client, role=RoleEnum.ADMIN)
    _login(app_client, admin["email"], admin["password"])
    response = app_client.patch(
        f"/reports/{report['id']}",
        json={"status": ReportStatusEnum.IN_PROGRESS.value},
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["status"] == ReportStatusEnum.IN_PROGRESS.value

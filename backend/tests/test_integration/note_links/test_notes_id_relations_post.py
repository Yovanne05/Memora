from http import HTTPStatus
from uuid import uuid4


def test_notes_relations_create_success(
    app_client, auth_context, collection_factory, note_factory
) :
    headers = auth_context["headers"]
    owner_id = auth_context["user"]["id"]

    collection = collection_factory(headers, owner_id)
    note_one = note_factory(headers, owner_id, collection["id"], title = "Note A")
    note_two = note_factory(headers, owner_id, collection["id"], title = "Note B")

    response = app_client.post(
        f"/notes/{note_one['id']}/relations",
        json = {"linked_note_id" : note_two["id"], "label" : "related"},
        headers = headers,
    )

    assert response.status_code == HTTPStatus.CREATED


def test_notes_relations_rejects_self_reference(
    app_client, auth_context, collection_factory, note_factory
) :
    headers = auth_context["headers"]
    owner_id = auth_context["user"]["id"]

    collection = collection_factory(headers, owner_id)
    note = note_factory(headers, owner_id, collection["id"])

    response = app_client.post(
        f"/notes/{note['id']}/relations",
        json = {"linked_note_id" : note["id"], "label" : "self"},
        headers = headers,
    )

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY


def test_notes_relations_rejects_cross_collection(
    app_client, auth_context, collection_factory, note_factory
) :
    headers = auth_context["headers"]
    owner_id = auth_context["user"]["id"]

    collection_one = collection_factory(headers, owner_id)
    collection_two = collection_factory(headers, owner_id)
    note_one = note_factory(headers, owner_id, collection_one["id"])
    note_two = note_factory(headers, owner_id, collection_two["id"])

    response = app_client.post(
        f"/notes/{note_one['id']}/relations",
        json = {"linked_note_id" : note_two["id"], "label" : "cross"},
        headers = headers,
    )

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY


def test_notes_relations_rejects_duplicate(
    app_client, auth_context, collection_factory, note_factory
) :
    headers = auth_context["headers"]
    owner_id = auth_context["user"]["id"]

    collection = collection_factory(headers, owner_id)
    note_one = note_factory(headers, owner_id, collection["id"], title = "Note X")
    note_two = note_factory(headers, owner_id, collection["id"], title = "Note Y")

    create_response = app_client.post(
        f"/notes/{note_one['id']}/relations",
        json = {"linked_note_id" : note_two["id"], "label" : "duplicate"},
        headers = headers,
    )
    assert create_response.status_code == HTTPStatus.CREATED

    duplicate_response = app_client.post(
        f"/notes/{note_one['id']}/relations",
        json = {"linked_note_id" : note_two["id"], "label" : "duplicate"},
        headers = headers,
    )

    assert duplicate_response.status_code == HTTPStatus.CONFLICT


def test_notes_relations_create_missing_note_returns_404_for_admin(
    app_client, admin_context, collection_factory, note_factory
) :
    headers = admin_context["headers"]
    owner_id = admin_context["user"]["id"]

    collection = collection_factory(headers, owner_id)
    target_note = note_factory(headers, owner_id, collection["id"])

    response = app_client.post(
        f"/notes/{uuid4()}/relations",
        json = {"linked_note_id" : target_note["id"], "label" : "missing"},
        headers = headers,
    )

    assert response.status_code == HTTPStatus.NOT_FOUND

from http import HTTPStatus
from uuid import uuid4

import bcrypt
import pytest

from daos.user_dao import User
from repositorys import user_repository
from utils.enums import RoleEnum


def _unique_suffix() -> str :
    return uuid4().hex[:8]


def _hash_password(raw_password : str) -> str :
    return bcrypt.hashpw(raw_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


@pytest.fixture
def make_user(app_client) :
    def _make_user(email : str | None = None, username : str | None = None, password : str | None = None) :
        suffix = _unique_suffix()
        email = email or f"int-{suffix}@example.com"
        username = username or f"int-{suffix}"
        password = password or f"StrongPass1!{suffix}"

        response = app_client.post(
            "/users",
            json = {
                "email" : email,
                "username" : username,
                "password" : password,
            },
        )
        assert response.status_code == HTTPStatus.CREATED, response.get_data(as_text = True)
        return response.get_json(), password

    return _make_user


@pytest.fixture
def login_user(app_client) :
    def _login_user(identifier : str, password : str) -> str :
        response = app_client.post(
            "/sessions",
            json = {"identifier" : identifier, "password" : password},
        )
        assert response.status_code == HTTPStatus.OK, response.get_data(as_text = True)
        return response.get_json()["access_token"]

    return _login_user


@pytest.fixture
def auth_headers() :
    def _auth_headers(token : str) -> dict[str, str] :
        return {"Authorization" : f"Bearer {token}"}

    return _auth_headers


@pytest.fixture
def auth_context(make_user, login_user, auth_headers) :
    user, password = make_user()
    token = login_user(user["email"], password)
    return {
        "user" : user,
        "password" : password,
        "token" : token,
        "headers" : auth_headers(token),
    }


@pytest.fixture
def other_user(make_user) :
    user, password = make_user()
    return {"user" : user, "password" : password}


@pytest.fixture
def admin_context(app_client, make_user, login_user, auth_headers) :
    suffix = _unique_suffix()
    password = f"AdminPass1!{suffix}"
    admin = User(
        id = str(uuid4()),
        email = f"admin-{suffix}@example.com",
        username = f"admin-{suffix}",
        password_hash = _hash_password(password),
        role = RoleEnum.ADMIN,
    )
    user_repository.add(admin)

    token = login_user(admin.email, password)
    headers = auth_headers(token)

    return {
        "user" : {
            "id" : admin.id,
            "email" : admin.email,
            "username" : admin.username,
            "role" : admin.role.value,
        },
        "password" : password,
        "token" : token,
        "headers" : headers,
    }


@pytest.fixture
def collection_factory(app_client) :
    def _make_collection(headers : dict[str, str], owner_id : str, name : str | None = None) :
        suffix = _unique_suffix()
        payload = {
            "name" : name or f"Collection {suffix}",
            "description" : "Integration test collection",
            "owner_id" : owner_id,
            "visibility" : "private",
            "tags" : ["integration"],
        }
        response = app_client.post("/collections", json = payload, headers = headers)
        assert response.status_code == HTTPStatus.CREATED, response.get_data(as_text = True)
        return response.get_json()

    return _make_collection


@pytest.fixture
def note_factory(app_client) :
    def _make_note(
        headers : dict[str, str],
        owner_id : str,
        collection_id : str | None = None,
        title : str | None = None,
    ) :
        suffix = _unique_suffix()
        payload = {
            "title" : title or f"Note {suffix}",
            "content" : "Integration test note",
            "owner_id" : owner_id,
            "visibility" : "private",
            "tags" : ["integration"],
        }
        if collection_id :
            payload["collection_id"] = collection_id

        response = app_client.post("/notes", json = payload, headers = headers)
        assert response.status_code == HTTPStatus.CREATED, response.get_data(as_text = True)
        return response.get_json()

    return _make_note


@pytest.fixture
def flashcard_factory(app_client) :
    def _make_flashcard(headers : dict[str, str], note_id : str, question : str | None = None) :
        suffix = _unique_suffix()
        payload = {
            "question" : question or f"Question {suffix}",
            "answers" : [
                {"answer_text" : "Correct", "is_correct" : True},
                {"answer_text" : "Wrong", "is_correct" : False},
            ],
        }
        response = app_client.post(
            f"/notes/{note_id}/flashcards", json = payload, headers = headers
        )
        assert response.status_code == HTTPStatus.CREATED, response.get_data(as_text = True)
        return response.get_json()

    return _make_flashcard


@pytest.fixture
def owner_context(auth_context, collection_factory, note_factory) :
    user = auth_context["user"]
    headers = auth_context["headers"]

    collection = collection_factory(headers, user["id"])
    note = note_factory(headers, user["id"], collection["id"])

    return {
        **auth_context,
        "collection" : collection,
        "note" : note,
    }

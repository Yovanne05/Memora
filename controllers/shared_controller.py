from http import HTTPStatus

from flask import Blueprint, jsonify

from services.impl.shared_service_impl import shared_service

bp_shared = Blueprint("shared", __name__, url_prefix="/shared")


@bp_shared.get("/notes/<token>")
def get_note(token: str):
    note_dto = shared_service.get_note_by_token(token)
    return jsonify(note_dto.model_dump()), HTTPStatus.OK


@bp_shared.get("/collections/<token>")
def get_collection(token: str):
    collection_dto = shared_service.get_collection_by_token(token)
    return jsonify(collection_dto.model_dump()), HTTPStatus.OK

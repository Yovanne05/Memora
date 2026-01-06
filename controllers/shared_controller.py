from http import HTTPStatus

from flask import Blueprint, jsonify
from flasgger import swag_from

from services.impl.shared_service_impl import shared_service

bp_shared = Blueprint("shared", __name__)

@swag_from("../docs/shared/get_note.yaml")
@bp_shared.get("/note-share-links/<link_id>")
def get_note(link_id: str):
    note_dto = shared_service.get_note_by_token(link_id)
    return jsonify(note_dto.model_dump()), HTTPStatus.OK

@swag_from("../docs/shared/get_collection.yaml")
@bp_shared.get("/collection-share-links/<link_id>")
def get_collection(link_id: str):
    collection_dto = shared_service.get_collection_by_token(link_id)
    return jsonify(collection_dto.model_dump()), HTTPStatus.OK

from http import HTTPStatus

from flask import Blueprint, jsonify
from flasgger import swag_from

from services.impl.shared_service_impl import shared_service

bp_shared_notes = Blueprint(
    "shared_notes", __name__, url_prefix="/shared/notes"
)


@bp_shared_notes.get("/<link_id>")
@swag_from("../docs/shared/get_note.yaml")
def get_note(link_id: str):
    note_dto = shared_service.get_note_by_token(link_id)
    return jsonify(note_dto.model_dump()), HTTPStatus.OK

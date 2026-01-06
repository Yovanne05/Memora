from http import HTTPStatus

from flask import Blueprint, jsonify
from flasgger import swag_from

from services.impl.shared_service_impl import shared_service

bp_note_public_links_access = Blueprint(
    "note_public_links_access", __name__, url_prefix="/note-public-links"
)


@bp_note_public_links_access.get("/<link_id>")
@swag_from("../docs/shared/get_note.yaml")
def get_note(link_id: str):
    note_dto = shared_service.get_note_by_token(link_id)
    return jsonify(note_dto.model_dump()), HTTPStatus.OK

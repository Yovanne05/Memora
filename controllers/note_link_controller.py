from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from flasgger import swag_from

from dtos.note_link_dto import NoteLinkCreateDTO
from services.impl.note.note_link_service_impl import note_link_service


bp_note_links = Blueprint(
    "note_links", __name__, url_prefix="/notes/<uuid:note_id>/links"
)


@bp_note_links.get("")
@jwt_required()
@swag_from("../docs/link_notes/links_list.yaml")
def find_many(note_id: UUID):
    link_dtos = note_link_service.list_links(str(note_id))
    return jsonify([dto.model_dump() for dto in link_dtos]), HTTPStatus.OK


@bp_note_links.post("")
@jwt_required()
@swag_from("../docs/link_notes/links_create.yaml")
def create(note_id: UUID):
    payload = NoteLinkCreateDTO.model_validate_json(request.data)
    link_dto = note_link_service.create_link(str(note_id), payload)
    return jsonify(link_dto.model_dump()), HTTPStatus.CREATED


@bp_note_links.delete("/<uuid:linked_note_id>")
@jwt_required()
@swag_from("../docs/link_notes/links_delete.yaml")
def delete(note_id: UUID, linked_note_id: UUID):
    note_link_service.delete_link(str(note_id), str(linked_note_id))
    return "", HTTPStatus.NO_CONTENT

from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from flasgger import swag_from

from dtos.note_link_dto import NoteLinkCreateDTO
from dtos.common_dto import ListResponseDTO
from querys.note_link_query import NoteLinkFindQuery
from services.impl.note.note_link_service_impl import note_link_service
from utils.permission_decorators import require_note_read, require_note_write


bp_note_relations = Blueprint(
    "note_relations", __name__, url_prefix="/notes/<uuid:note_id>/relations"
)


@bp_note_relations.get("")
@jwt_required()
@swag_from("../docs/link_notes/links_list.yaml")
@require_note_read()
def find_many(note_id: UUID):
    raw_query = request.args.to_dict(flat=True)
    raw_query["note_id"] = str(note_id)
    query = NoteLinkFindQuery.model_validate(raw_query)
    params = query.to_params()

    link_dtos, total = note_link_service.find_many(params)
    response = ListResponseDTO(
        items=[dto.model_dump() for dto in link_dtos],
        total=total
    )
    return jsonify(response.model_dump()), HTTPStatus.OK


@bp_note_relations.post("")
@jwt_required()
@swag_from("../docs/link_notes/links_create.yaml")
@require_note_write()
def create(note_id: UUID):
    payload = NoteLinkCreateDTO.model_validate_json(request.data)
    link_dto = note_link_service.create_link(str(note_id), payload)
    return jsonify(link_dto.model_dump()), HTTPStatus.CREATED


@bp_note_relations.delete("/<uuid:linked_note_id>")
@jwt_required()
@swag_from("../docs/link_notes/links_delete.yaml")
@require_note_write()
def delete(note_id: UUID, linked_note_id: UUID):
    note_link_service.delete_link(str(note_id), str(linked_note_id))
    return "", HTTPStatus.NO_CONTENT

from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from flasgger import swag_from

from dtos.note_dto import NoteCreateDTO, NoteUpdateDTO
from dtos.common_dto import ListResponseDTO
from querys.note_query import NoteFindQuery
from services.impl.note.note_crud_service_impl import note_crud_service
from utils.permission_decorators import (
    require_note_read,
    require_note_write,
    require_owner,
)


bp_notes = Blueprint("notes", __name__, url_prefix="/notes")


@bp_notes.get("")
@jwt_required()
@swag_from("../docs/notes/list.yaml")
def find_many():
    raw_query = request.args.to_dict(flat=True)
    query = NoteFindQuery.model_validate(raw_query)
    params = query.to_params()

    note_dtos, total = note_crud_service.find_many(params)
    response = ListResponseDTO(
        items=[dto.model_dump() for dto in note_dtos],
        total=total
    )
    return jsonify(response.model_dump()), HTTPStatus.OK


@bp_notes.get("/<uuid:note_id>")
@jwt_required()
@swag_from("../docs/notes/find_one.yaml")
@require_note_read()
def find_one(note_id: UUID):
    note = note_crud_service.find_one(str(note_id))
    return jsonify(note.model_dump()), HTTPStatus.OK


@bp_notes.post("")
@jwt_required()
@swag_from("../docs/notes/create.yaml")
def create():
    payload = NoteCreateDTO.model_validate_json(request.data)
    note = note_crud_service.create(payload)
    return jsonify(note.model_dump()), HTTPStatus.CREATED


@bp_notes.patch("/<uuid:note_id>")
@jwt_required()
@swag_from("../docs/notes/update.yaml")
@require_note_write()
def update(note_id: UUID):
    payload = NoteUpdateDTO.model_validate_json(request.data)
    note = note_crud_service.update(str(note_id), payload)
    return jsonify(note.model_dump()), HTTPStatus.OK


@bp_notes.delete("/<uuid:note_id>")
@jwt_required()
@swag_from("../docs/notes/delete.yaml")
@require_owner("note", "note_id")
def delete(note_id: UUID):
    note_crud_service.delete(str(note_id))
    return "", HTTPStatus.NO_CONTENT

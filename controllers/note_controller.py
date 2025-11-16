from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flasgger import swag_from

from dtos.note_dto import NoteCreateDTO, NoteUpdateDTO
from querys.note_query import NoteFindQuery
from services.impl.note_service_impl import note_service

bp_notes = Blueprint("notes", __name__, url_prefix="/notes")


@swag_from("../docs/notes/list.yaml")
@bp_notes.get("")
def find_many():
    raw_query = request.args.to_dict(flat=True)
    query = NoteFindQuery.model_validate(raw_query)
    params = query.to_params()

    note_dtos, total = note_service.find_many(params)
    return (
        jsonify(
            {"items": [dto.model_dump() for dto in note_dtos], "total": total}
        ),
        HTTPStatus.OK,
    )


@swag_from("../docs/notes/find_one.yaml")
@bp_notes.get("/<uuid:note_id>")
def find_one(note_id: UUID):
    note = note_service.find_one(str(note_id))
    return jsonify(note.model_dump()), HTTPStatus.OK


@swag_from("../docs/notes/create.yaml")
@bp_notes.post("")
def create():
    payload = NoteCreateDTO.model_validate_json(request.data)
    note = note_service.create(payload)
    return jsonify(note.model_dump()), HTTPStatus.CREATED


@swag_from("../docs/notes/update.yaml")
@bp_notes.put("/<uuid:note_id>")
def update(note_id: UUID):
    payload = NoteUpdateDTO.model_validate_json(request.data)
    note = note_service.update(str(note_id), payload)
    return jsonify(note.model_dump()), HTTPStatus.OK


@swag_from("../docs/notes/delete.yaml")
@bp_notes.delete("/<uuid:note_id>")
def delete(note_id: UUID):
    note_service.delete(str(note_id))
    return "", HTTPStatus.NO_CONTENT

from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flasgger import swag_from

from dtos.note_dto import NoteCreateDTO, NoteUpdateDTO
from querys.note_query import NoteFindQuery
from services.impl.note.note_crud_service_impl import note_crud_service
from services.impl.favorite.note_favorite_service_impl import (
    note_favorite_service,
)


bp_notes = Blueprint("notes", __name__, url_prefix="/notes")


@bp_notes.get("")
@swag_from("../docs/notes/list.yaml")
def find_many():
    raw_query = request.args.to_dict(flat=True)
    query = NoteFindQuery.model_validate(raw_query)
    params = query.to_params()

    note_dtos, total = note_crud_service.find_many(params)
    return (
        jsonify(
            {"items": [dto.model_dump() for dto in note_dtos], "total": total}
        ),
        HTTPStatus.OK,
    )


@bp_notes.get("/<uuid:note_id>")
@swag_from("../docs/notes/find_one.yaml")
def find_one(note_id: UUID):
    note = note_crud_service.find_one(str(note_id))
    return jsonify(note.model_dump()), HTTPStatus.OK


@bp_notes.post("")
@swag_from("../docs/notes/create.yaml")
def create():
    payload = NoteCreateDTO.model_validate_json(request.data)
    note = note_crud_service.create(payload)
    return jsonify(note.model_dump()), HTTPStatus.CREATED


@bp_notes.patch("/<uuid:note_id>")
@swag_from("../docs/notes/update.yaml")
def update(note_id: UUID):
    payload = NoteUpdateDTO.model_validate_json(request.data)
    note = note_crud_service.update(str(note_id), payload)
    return jsonify(note.model_dump()), HTTPStatus.OK


@bp_notes.delete("/<uuid:note_id>")
@swag_from("../docs/notes/delete.yaml")
def delete(note_id: UUID):
    note_crud_service.delete(str(note_id))
    return "", HTTPStatus.NO_CONTENT


@bp_notes.post("/<uuid:note_id>/favorites")
@swag_from("../docs/notes/favorite_add.yaml")
def add_favorite(note_id: UUID):
    favorite = note_favorite_service.add_favorite(str(note_id))
    return jsonify(favorite.model_dump()), HTTPStatus.CREATED


@bp_notes.delete("/<uuid:note_id>/favorites")
@swag_from("../docs/notes/favorite_delete.yaml")
def remove_favorite(note_id: UUID):
    note_favorite_service.remove_favorite(str(note_id))
    return "", HTTPStatus.NO_CONTENT

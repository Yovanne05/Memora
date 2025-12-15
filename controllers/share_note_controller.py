from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from flasgger import swag_from

from dtos.note_share_dto import NoteShareCreateDTO, NoteShareUpdateDTO
from querys.note_share_query import NoteShareFindQuery
from services.impl.note.note_share_service_impl import note_share_service

bp_note_shares = Blueprint("note_shares", __name__, url_prefix="/note-shares")


@bp_note_shares.get("")
@jwt_required()
@swag_from("../docs/share_notes/share_list.yaml")
def find_many():
    raw_query = request.args.to_dict(flat=True)
    query = NoteShareFindQuery.model_validate(raw_query)
    params = query.to_params()

    share_dtos, total = note_share_service.find_many(params)
    return (
        jsonify({"items": [dto.model_dump() for dto in share_dtos], "total": total}),
        HTTPStatus.OK,
    )


@bp_note_shares.post("")
@jwt_required()
@swag_from("../docs/share_notes/share_create.yaml")
def create():
    payload = NoteShareCreateDTO.model_validate_json(request.data)
    share_dto = note_share_service.share_note(payload.note_id, payload)
    return jsonify(share_dto.model_dump()), HTTPStatus.CREATED


@bp_note_shares.patch("/<uuid:note_id>/shares/<uuid:user_id>")
@jwt_required()
@swag_from("../docs/share_notes/share_update.yaml")
def update(note_id: UUID, user_id: UUID):
    payload = NoteShareUpdateDTO.model_validate_json(request.data)
    share_dto = note_share_service.update_share(note_id, user_id, payload)
    return jsonify(share_dto.model_dump()), HTTPStatus.OK


@bp_note_shares.delete("/<uuid:note_id>/shares/<uuid:user_id>")
@jwt_required()
@swag_from("../docs/share_notes/share_delete.yaml")
def delete(note_id: UUID, user_id: UUID):
    note_share_service.revoke_share(note_id, user_id)
    return "", HTTPStatus.NO_CONTENT

from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flasgger import swag_from

from dtos.note_share_dto import NoteShareCreateDTO, NoteShareUpdateDTO
from dtos.common_dto import ListResponseDTO
from querys.note_share_query import NoteShareFindQuery
from services.impl.note.note_share_service_impl import note_share_service

bp_note_shares = Blueprint(
    "note_shares", __name__, url_prefix="/notes/<uuid:note_id>/shares"
)


@bp_note_shares.get("")
@swag_from("../docs/share_notes/share_list.yaml")
def find_many(note_id: UUID):
    raw_query = request.args.to_dict(flat=True)
    raw_query["noteId"] = str(note_id)
    query = NoteShareFindQuery.model_validate(raw_query)
    params = query.to_params()

    share_dtos, total = note_share_service.find_many(params)
    response = ListResponseDTO(
        items=[dto.model_dump() for dto in share_dtos],
        total=total
    )
    return jsonify(response.model_dump()), HTTPStatus.OK


@bp_note_shares.post("")
@swag_from("../docs/share_notes/share_create.yaml")
def create(note_id: UUID):
    payload = NoteShareCreateDTO.model_validate_json(request.data)
    share_dto = note_share_service.share_note(str(note_id), payload)
    return jsonify(share_dto.model_dump()), HTTPStatus.CREATED


@bp_note_shares.patch("/<uuid:user_id>")
@swag_from("../docs/share_notes/share_update.yaml")
def update(note_id: UUID, user_id: UUID):
    payload = NoteShareUpdateDTO.model_validate_json(request.data)
    share_dto = note_share_service.update_share(
        str(note_id), str(user_id), payload
    )
    return jsonify(share_dto.model_dump()), HTTPStatus.OK


@bp_note_shares.delete("/<uuid:user_id>")
@swag_from("../docs/share_notes/share_delete.yaml")
def delete(note_id: UUID, user_id: UUID):
    note_share_service.revoke_share(str(note_id), str(user_id))
    return "", HTTPStatus.NO_CONTENT

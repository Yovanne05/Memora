from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flasgger import swag_from

from dtos.note_share_dto import NoteShareCreateDTO, NoteShareUpdateDTO
from services.impl.note.note_share_service_impl import note_share_service

bp_note_shares = Blueprint("note_shares", __name__, url_prefix="/notes")


@swag_from("../docs/notes/share_list.yaml")
@bp_note_shares.get("/<uuid:note_id>/shares")
def list_shares(note_id: UUID):
    share_dtos = note_share_service.list_shares(str(note_id))
    return (
        jsonify(
            {
                "items": [dto.model_dump() for dto in share_dtos],
                "total": len(share_dtos),
            }
        ),
        HTTPStatus.OK,
    )


@swag_from("../docs/notes/share_create.yaml")
@bp_note_shares.post("/<uuid:note_id>/shares")
def share_note(note_id: UUID):
    payload = NoteShareCreateDTO.model_validate_json(request.data)
    share_dto = note_share_service.share_note(str(note_id), payload)
    return jsonify(share_dto.model_dump()), HTTPStatus.CREATED


@swag_from("../docs/notes/share_update.yaml")
@bp_note_shares.patch("/<uuid:note_id>/shares/<uuid:user_id>")
def update_share(note_id: UUID, user_id: UUID):
    payload = NoteShareUpdateDTO.model_validate_json(request.data)
    share_dto = note_share_service.update_share(
        str(note_id), str(user_id), payload
    )
    return jsonify(share_dto.model_dump()), HTTPStatus.OK


@swag_from("../docs/notes/share_delete.yaml")
@bp_note_shares.delete("/<uuid:note_id>/shares/<uuid:user_id>")
def revoke_share(note_id: UUID, user_id: UUID):
    note_share_service.revoke_share(str(note_id), str(user_id))
    return "", HTTPStatus.NO_CONTENT

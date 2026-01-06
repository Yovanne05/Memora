from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from flasgger import swag_from

from dtos.note_share_link_dto import NoteShareLinkCreateDTO
from querys.note_share_link_query import NoteShareLinkFindQuery
from services.impl.note.note_share_link_service_impl import (
    note_share_link_service,
)

bp_note_share_links = Blueprint(
    "note_share_links",
    __name__,
    url_prefix="/notes/<uuid:note_id>/share-links",
)


@bp_note_share_links.get("")
@jwt_required()
@swag_from("../docs/note_share_links/list.yaml")
def find_many(note_id: UUID):
    raw_query = request.args.to_dict(flat=True)
    raw_query["noteId"] = str(note_id)
    query = NoteShareLinkFindQuery.model_validate(raw_query)
    params = query.to_params()

    share_link_dtos, total = note_share_link_service.find_many(params)
    return (
        jsonify(
            {"items": [dto.model_dump() for dto in share_link_dtos], "total": total}
        ),
        HTTPStatus.OK,
    )


@bp_note_share_links.post("")
@jwt_required()
@swag_from("../docs/note_share_links/create.yaml")
def create(note_id: UUID):
    payload = NoteShareLinkCreateDTO.model_validate_json(request.data)
    share_link_dto = note_share_link_service.create_share_link(
        str(note_id), payload
    )
    return jsonify(share_link_dto.model_dump()), HTTPStatus.CREATED


@bp_note_share_links.delete("/<uuid:link_id>")
@jwt_required()
@swag_from("../docs/note_share_links/delete.yaml")
def delete(note_id: UUID, link_id: UUID):
    note_share_link_service.delete_share_link(str(note_id), str(link_id))
    return "", HTTPStatus.NO_CONTENT

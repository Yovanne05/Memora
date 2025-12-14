from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from flasgger import swag_from

from dtos.note_dto import NoteCreateDTO, NoteUpdateDTO
from dtos.note_link_dto import NoteLinkCreateDTO
from dtos.note_share_dto import NoteShareCreateDTO, NoteShareUpdateDTO
from querys.note_query import NoteFindQuery
from services.impl.note.note_crud_service_impl import note_crud_service
from services.impl.note.note_link_service_impl import note_link_service
from services.impl.note.note_share_service_impl import note_share_service

bp_notes = Blueprint("notes", __name__, url_prefix="/notes")


@swag_from("../docs/notes/list.yaml")
@bp_notes.get("")
@jwt_required()
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


@swag_from("../docs/notes/find_one.yaml")
@bp_notes.get("/<uuid:note_id>")
@jwt_required()
def find_one(note_id: UUID):
    note = note_crud_service.find_one(str(note_id))
    return jsonify(note.model_dump()), HTTPStatus.OK


@swag_from("../docs/notes/create.yaml")
@bp_notes.post("")
@jwt_required()
def create():
    payload = NoteCreateDTO.model_validate_json(request.data)
    note = note_crud_service.create(payload)
    return jsonify(note.model_dump()), HTTPStatus.CREATED


@swag_from("../docs/notes/update.yaml")
@bp_notes.patch("/<uuid:note_id>")
@jwt_required()
def update(note_id: UUID):
    payload = NoteUpdateDTO.model_validate_json(request.data)
    note = note_crud_service.update(str(note_id), payload)
    return jsonify(note.model_dump()), HTTPStatus.OK


@swag_from("../docs/notes/delete.yaml")
@bp_notes.delete("/<uuid:note_id>")
@jwt_required()
def delete(note_id: UUID):
    note_crud_service.delete(str(note_id))
    return "", HTTPStatus.NO_CONTENT


@swag_from("../docs/notes/share_list.yaml")
@bp_notes.get("/<uuid:note_id>/shares")
@jwt_required()
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
@bp_notes.post("/<uuid:note_id>/shares")
@jwt_required()
def share_note(note_id: UUID):
    payload = NoteShareCreateDTO.model_validate_json(request.data)
    share_dto = note_share_service.share_note(str(note_id), payload)
    return jsonify(share_dto.model_dump()), HTTPStatus.CREATED


@swag_from("../docs/notes/share_update.yaml")
@bp_notes.patch("/<uuid:note_id>/shares/<uuid:user_id>")
@jwt_required()
def update_share(note_id: UUID, user_id: UUID):
    payload = NoteShareUpdateDTO.model_validate_json(request.data)
    share_dto = note_share_service.update_share(
        str(note_id), str(user_id), payload
    )
    return jsonify(share_dto.model_dump()), HTTPStatus.OK


@swag_from("../docs/notes/share_delete.yaml")
@bp_notes.delete("/<uuid:note_id>/shares/<uuid:user_id>")
@jwt_required()
def revoke_share(note_id: UUID, user_id: UUID):
    note_share_service.revoke_share(str(note_id), str(user_id))
    return "", HTTPStatus.NO_CONTENT


@swag_from("../docs/notes/links_list.yaml")
@bp_notes.get("/<uuid:note_id>/links")
@jwt_required()
def list_links(note_id: UUID):
    link_dtos = note_link_service.list_links(str(note_id))
    return (
        jsonify(
            {
                "items": [dto.model_dump() for dto in link_dtos],
                "total": len(link_dtos),
            }
        ),
        HTTPStatus.OK,
    )


@swag_from("../docs/notes/links_create.yaml")
@bp_notes.post("/<uuid:note_id>/links")
@jwt_required()
def create_link(note_id: UUID):
    payload = NoteLinkCreateDTO.model_validate_json(request.data)
    link_dto = note_link_service.create_link(str(note_id), payload)
    return jsonify(link_dto.model_dump()), HTTPStatus.CREATED


@swag_from("../docs/notes/links_delete.yaml")
@bp_notes.delete("/<uuid:note_id>/links/<uuid:linked_note_id>")
@jwt_required()
def delete_link(note_id: UUID, linked_note_id: UUID):
    note_link_service.delete_link(str(note_id), str(linked_note_id))
    return "", HTTPStatus.NO_CONTENT

from http import HTTPStatus

from flask import Blueprint, jsonify, request, g
from flasgger import swag_from

from dtos.collab_dto import (
    CollabDocumentUpdateDTO,
    CollabSessionCreateDTO,
    CollabSessionVerifyDTO,
)
from services.impl.collab_service_impl import collab_service
from utils.collab_auth import require_collab_api_key, require_collab_scope


bp_collab = Blueprint("collab", __name__, url_prefix="/collab")


@bp_collab.post("/sessions")
@swag_from("../docs/collab/sessions_create.yaml")
def create_session():
    payload = CollabSessionCreateDTO.model_validate_json(request.data)
    dto = collab_service.create_session(payload.note_id)
    return jsonify(dto.model_dump()), HTTPStatus.OK


@bp_collab.post("/sessions/verify")
@swag_from("../docs/collab/sessions_verify.yaml")
@require_collab_api_key()
@require_collab_scope()
def verify_session():
    payload = CollabSessionVerifyDTO.model_validate_json(request.data)
    dto = collab_service.verify_session(payload, g.collab_payload)
    return jsonify(dto.model_dump()), HTTPStatus.OK


@bp_collab.get("/documents/<string:note_id>")
@swag_from("../docs/collab/documents_get.yaml")
@require_collab_api_key()
def get_document(note_id: str):
    dto = collab_service.get_document(note_id)
    return jsonify(dto.model_dump()), HTTPStatus.OK


@bp_collab.put("/documents/<string:note_id>")
@swag_from("../docs/collab/documents_put.yaml")
@require_collab_api_key()
def store_document(note_id: str):
    payload = CollabDocumentUpdateDTO.model_validate_json(request.data)
    collab_service.store_document(
        note_id,
        payload.yjs_snapshot,
    )
    return "", HTTPStatus.NO_CONTENT

from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from flasgger import swag_from

from dtos.flashcard_dto import (
    FlashcardCreateDTO,
    FlashcardUpdateDTO,
)
from dtos.common_dto import ListResponseDTO
from querys.flashcard_query import FlashcardFindQuery
from services.impl.note.flashcard_service_impl import flashcard_service
from utils.permission_decorators import require_note_write

bp_flashcards = Blueprint("flashcards", __name__, url_prefix="/flashcards")
bp_note_flashcards = Blueprint(
    "note_flashcards",
    __name__,
    url_prefix="/notes/<uuid:note_id>/flashcards",
)


@bp_flashcards.get("")
@jwt_required()
@swag_from("../docs/flashcards/list.yaml")
def find_many():
    raw_query = request.args.to_dict(flat=True)
    query = FlashcardFindQuery.model_validate(raw_query)
    params = query.to_params()

    flashcard_dtos, total = flashcard_service.find_many(params)
    response = ListResponseDTO(
        items=[dto.model_dump() for dto in flashcard_dtos],
        total=total
    )
    return jsonify(response.model_dump()), HTTPStatus.OK


@bp_flashcards.get("/<uuid:flashcard_id>")
@jwt_required()
@swag_from("../docs/flashcards/find_one.yaml")
def find_one(flashcard_id: UUID):
    flashcard = flashcard_service.find_one(str(flashcard_id))
    return jsonify(flashcard.model_dump()), HTTPStatus.OK


@bp_note_flashcards.post("")
@jwt_required()
@swag_from("../docs/flashcards/create.yaml")
@require_note_write()
def create(note_id: UUID):
    payload = FlashcardCreateDTO.model_validate_json(request.data)
    flashcard = flashcard_service.create(str(note_id), payload)
    return jsonify(flashcard.model_dump()), HTTPStatus.CREATED


@bp_flashcards.patch("/<uuid:flashcard_id>")
@jwt_required()
@swag_from("../docs/flashcards/update.yaml")
def update(flashcard_id: UUID):
    payload = FlashcardUpdateDTO.model_validate_json(request.data)
    flashcard = flashcard_service.update(str(flashcard_id), payload)
    return jsonify(flashcard.model_dump()), HTTPStatus.OK


@bp_flashcards.delete("/<uuid:flashcard_id>")
@jwt_required()
@swag_from("../docs/flashcards/delete.yaml")
def delete(flashcard_id: UUID):
    flashcard_service.delete(str(flashcard_id))
    return "", HTTPStatus.NO_CONTENT


@bp_flashcards.post("/<uuid:flashcard_id>/duplicates")
@jwt_required()
@swag_from("../docs/flashcards/duplicate.yaml")
def duplicate(flashcard_id: UUID):
    flashcard = flashcard_service.duplicate(str(flashcard_id))
    return jsonify(flashcard.model_dump()), HTTPStatus.CREATED

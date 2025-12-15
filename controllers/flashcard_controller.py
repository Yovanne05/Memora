from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from flasgger import swag_from

from dtos.flashcard_dto import (
    FlashcardCreateDTO,
    FlashcardDuplicateDTO,
    FlashcardUpdateDTO,
)
from services.impl.note.flashcard_service_impl import flashcard_service

bp_flashcards = Blueprint("flashcards", __name__, url_prefix="/flashcards")


@bp_flashcards.get("")
@jwt_required()
@swag_from("../docs/flashcards/list.yaml")
def find_many():
    note_id = request.args.get("note_id")
    flashcards = flashcard_service.list_flashcards(note_id)
    return jsonify([fc.model_dump() for fc in flashcards]), HTTPStatus.OK


@bp_flashcards.get("/<uuid:flashcard_id>")
@jwt_required()
@swag_from("../docs/flashcards/find_one.yaml")
def find_one(flashcard_id: UUID):
    flashcard = flashcard_service.find_one(str(flashcard_id))
    return jsonify(flashcard.model_dump()), HTTPStatus.OK


@bp_flashcards.post("")
@jwt_required()
@swag_from("../docs/flashcards/create.yaml")
def create():
    payload = FlashcardCreateDTO.model_validate_json(request.data)
    flashcard = flashcard_service.create(payload.note_id, payload)
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


@bp_flashcards.post("/<uuid:flashcard_id>/duplicate")
@jwt_required()
def duplicate(flashcard_id: UUID):
    payload = FlashcardDuplicateDTO.model_validate_json(request.data or "{}")
    flashcard = flashcard_service.duplicate(str(flashcard_id), payload)
    return jsonify(flashcard.model_dump()), HTTPStatus.CREATED

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

bp_flashcards = Blueprint("flashcards", __name__, url_prefix="/notes")


@bp_flashcards.get("/<uuid:note_id>/flashcards")
@jwt_required()
@swag_from("../docs/notes/flashcard_list.yaml")
def list_flashcards(note_id: UUID):
    flashcards = flashcard_service.list_flashcards(str(note_id))
    return jsonify([fc.model_dump() for fc in flashcards]), HTTPStatus.OK


@bp_flashcards.post("/<uuid:note_id>/flashcards")
@jwt_required()
@swag_from("../docs/notes/flashcard_create.yaml")
def create_flashcard(note_id: UUID):
    payload = FlashcardCreateDTO.model_validate_json(request.data)
    flashcard = flashcard_service.create(str(note_id), payload)
    return jsonify(flashcard.model_dump()), HTTPStatus.CREATED


@bp_flashcards.get("/flashcards/<uuid:flashcard_id>")
@jwt_required()
@swag_from("../docs/notes/flashcard_find_one.yaml")
def find_one(flashcard_id: UUID):
    flashcard = flashcard_service.find_one(str(flashcard_id))
    return jsonify(flashcard.model_dump()), HTTPStatus.OK


@bp_flashcards.patch("/flashcards/<uuid:flashcard_id>")
@jwt_required()
@swag_from("../docs/notes/flashcard_update.yaml")
def update_flashcard(flashcard_id: UUID):
    payload = FlashcardUpdateDTO.model_validate_json(request.data)
    flashcard = flashcard_service.update(str(flashcard_id), payload)
    return jsonify(flashcard.model_dump()), HTTPStatus.OK


@bp_flashcards.post("/flashcards/<uuid:flashcard_id>/duplicate")
@jwt_required()
def duplicate_flashcard(flashcard_id: UUID):
    payload = FlashcardDuplicateDTO.model_validate_json(request.data or "{}")
    flashcard = flashcard_service.duplicate(str(flashcard_id), payload)
    return jsonify(flashcard.model_dump()), HTTPStatus.CREATED


@bp_flashcards.delete("/flashcards/<uuid:flashcard_id>")
@jwt_required()
@swag_from("../docs/notes/flashcard_delete.yaml")
def delete_flashcard(flashcard_id: UUID):
    flashcard_service.delete(str(flashcard_id))
    return "", HTTPStatus.NO_CONTENT

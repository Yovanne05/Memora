from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from dtos.flashcard_dto import FlashcardCreateDTO, FlashcardUpdateDTO
from services.impl.note.flashcard_service_impl import flashcard_service

bp_flashcards = Blueprint("flashcards", __name__, url_prefix="/notes")


@bp_flashcards.get("/<uuid:note_id>/flashcards")
@jwt_required()
def list_flashcards(note_id: UUID):
    flashcards = flashcard_service.list_flashcards(str(note_id))
    return jsonify([fc.model_dump() for fc in flashcards]), HTTPStatus.OK


@bp_flashcards.post("/<uuid:note_id>/flashcards")
@jwt_required()
def create_flashcard(note_id: UUID):
    payload = FlashcardCreateDTO.model_validate_json(request.data)
    flashcard = flashcard_service.create(str(note_id), payload)
    return jsonify(flashcard.model_dump()), HTTPStatus.CREATED


@bp_flashcards.get("/flashcards/<uuid:flashcard_id>")
@jwt_required()
def find_one(flashcard_id: UUID):
    flashcard = flashcard_service.find_one(str(flashcard_id))
    return jsonify(flashcard.model_dump()), HTTPStatus.OK


@bp_flashcards.patch("/flashcards/<uuid:flashcard_id>")
@jwt_required()
def update_flashcard(flashcard_id: UUID):
    payload = FlashcardUpdateDTO.model_validate_json(request.data)
    flashcard = flashcard_service.update(str(flashcard_id), payload)
    return jsonify(flashcard.model_dump()), HTTPStatus.OK


@bp_flashcards.delete("/flashcards/<uuid:flashcard_id>")
@jwt_required()
def delete_flashcard(flashcard_id: UUID):
    flashcard_service.delete(str(flashcard_id))
    return "", HTTPStatus.NO_CONTENT

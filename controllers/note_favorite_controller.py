from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from flasgger import swag_from

from services.impl.favorite.note_favorite_service_impl import (
    note_favorite_service,
)
from utils.permission_decorators import require_note_read

bp_note_favorites = Blueprint(
    "note_favorites", __name__, url_prefix="/notes/<uuid:note_id>/favorites"
)


@bp_note_favorites.post("")
@jwt_required()
@swag_from("../docs/notes/favorite_add.yaml")
@require_note_read()
def add_favorite(note_id: UUID):
    favorite = note_favorite_service.add_favorite(str(note_id))
    return jsonify(favorite.model_dump()), HTTPStatus.CREATED


@bp_note_favorites.delete("")
@jwt_required()
@swag_from("../docs/notes/favorite_delete.yaml")
@require_note_read()
def remove_favorite(note_id: UUID):
    note_favorite_service.remove_favorite(str(note_id))
    return "", HTTPStatus.NO_CONTENT

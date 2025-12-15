from http import HTTPStatus
from uuid import UUID
import os

from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import jwt_required
from flasgger import swag_from

from services.impl.note.note_image_service_impl import note_image_service
from exceptions.note_image_exception import NoFileProvided, NoteImageNotFound

bp_note_images = Blueprint("note_images", __name__, url_prefix="/notes")


@bp_note_images.get("/<uuid:note_id>")
@jwt_required()
@swag_from("../docs/notes_images/list.yaml")
def find_many(note_id: UUID):
    images = note_image_service.list_images(str(note_id))
    return jsonify([img.model_dump() for img in images]), HTTPStatus.OK


@bp_note_images.get("/<uuid:note_id>/images/<filename>")
@jwt_required()
@swag_from("../docs/notes_images/get.yaml")
def find_one(note_id: UUID, filename: str):
    filepath = os.path.join("uploads/notes", str(note_id), filename)

    if not os.path.exists(filepath):
        raise NoteImageNotFound()

    return send_file(filepath, mimetype="image/jpeg")


@bp_note_images.post("/<uuid:note_id>")
@jwt_required()
@swag_from("../docs/notes_images/upload.yaml")
def create(note_id: UUID):
    if "image" not in request.files:
        raise NoFileProvided()

    file = request.files["image"]
    image_dto = note_image_service.upload_image(str(note_id), file)
    return jsonify(image_dto.model_dump()), HTTPStatus.CREATED


@bp_note_images.delete("/<uuid:note_id>/images/<filename>")
@jwt_required()
@swag_from("../docs/notes_images/delete.yaml")
def delete(note_id: UUID, filename: str):
    note_image_service.delete_image(str(note_id), filename)
    return "", HTTPStatus.NO_CONTENT

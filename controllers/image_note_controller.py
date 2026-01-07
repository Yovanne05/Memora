from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from flasgger import swag_from

from services.impl.note.note_image_service_impl import note_image_service
from exceptions.note_image_exception import NoFileProvided

bp_note_images = Blueprint("note_images", __name__, url_prefix="/notes")


@bp_note_images.post("/<uuid:note_id>/attachments")
@jwt_required()
@swag_from("../docs/notes_images/upload.yaml")
def create(note_id: UUID):
    if "image" not in request.files:
        raise NoFileProvided()

    file = request.files["image"]
    image_dto = note_image_service.upload_image(str(note_id), file)
    return jsonify(image_dto.model_dump()), HTTPStatus.CREATED

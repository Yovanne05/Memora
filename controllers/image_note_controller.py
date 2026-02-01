import os
from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import jwt_required
from flasgger import swag_from

from services.impl.note.note_image_service_impl import note_image_service
from exceptions.note_image_exception import NoFileProvided
from exceptions.upload_exception import (
    UploadsNotAvailable,
    UploadInvalidKey,
    UploadNotFound,
)
from utils.storage import StorageError, get_storage_client

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


@bp_note_images.get("/<uuid:note_id>/attachments/<path:filename>")
@swag_from("../docs/uploads/serve_upload.yaml")
def serve_attachment(note_id: UUID, filename: str):
    """Serve attachment files for a specific note."""
    storage = get_storage_client()
    if getattr(storage, "driver", None) != "local":
        raise UploadsNotAvailable()

    # Build the key from note_id and filename
    key = f"{note_id}/{filename}"

    try:
        path = storage.resolve_local_path(key)
    except StorageError as e:
        raise UploadInvalidKey() from e

    if not path:
        raise UploadInvalidKey()

    if not os.path.isfile(path):
        raise UploadNotFound()

    return send_file(path)

from http import HTTPStatus
from uuid import UUID
import os

from flask import Blueprint, jsonify, request, send_file
from flasgger import swag_from

from services.impl.note.note_image_service_impl import note_image_service
from exceptions.note_exception import NoteNotFound

bp_note_images = Blueprint("note_images", __name__, url_prefix="/notes")


@swag_from("../docs/notes/image_upload.yaml")
@bp_note_images.post("/<uuid:note_id>/images")
def upload_image(note_id: UUID):
    """Upload une image pour une note."""
    try:
        if "image" not in request.files:
            return jsonify({"error": "Aucune image fournie"}), HTTPStatus.BAD_REQUEST

        file = request.files["image"]
        filepath = note_image_service.upload_image(str(note_id), file)

        return (
            jsonify(
                {
                    "filepath": filepath,
                    "filename": os.path.basename(filepath),
                }
            ),
            HTTPStatus.CREATED,
        )
    except NoteNotFound:
        return jsonify({"error": "Note introuvable"}), HTTPStatus.NOT_FOUND
    except ValueError as e:
        return jsonify({"error": str(e)}), HTTPStatus.BAD_REQUEST
    except Exception as e:
        return (
            jsonify({"error": "Erreur lors de l'upload de l'image"}),
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )


@swag_from("../docs/notes/image_get.yaml")
@bp_note_images.get("/<uuid:note_id>/images/<filename>")
def get_image(note_id: UUID, filename: str):
    """Récupère une image d'une note."""
    try:
        filepath = os.path.join("uploads/notes", str(note_id), filename)

        if not os.path.exists(filepath):
            return jsonify({"error": "Image introuvable"}), HTTPStatus.NOT_FOUND

        return send_file(filepath, mimetype="image/jpeg")
    except Exception as e:
        return (
            jsonify({"error": "Erreur lors de la récupération de l'image"}),
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )


@swag_from("../docs/notes/image_delete.yaml")
@bp_note_images.delete("/<uuid:note_id>/images/<filename>")
def delete_image(note_id: UUID, filename: str):
    """Supprime une image d'une note."""
    try:
        note_image_service.delete_image(str(note_id), filename)
        return "", HTTPStatus.NO_CONTENT
    except NoteNotFound:
        return jsonify({"error": "Note introuvable"}), HTTPStatus.NOT_FOUND
    except ValueError as e:
        return jsonify({"error": str(e)}), HTTPStatus.NOT_FOUND
    except Exception as e:
        return (
            jsonify({"error": "Erreur lors de la suppression de l'image"}),
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )

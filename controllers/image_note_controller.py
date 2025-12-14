from http import HTTPStatus
from uuid import UUID
import os

from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import jwt_required
from flasgger import swag_from

from services.impl.note.note_image_service_impl import note_image_service
from exceptions.note_exception import NoteNotFound
from utils.swagger import swagger_doc

bp_note_images = Blueprint("note_images", __name__, url_prefix="/notes")


@swag_from(swagger_doc("notes/image_upload.yaml"))
@bp_note_images.post("/<uuid:note_id>/images")
@jwt_required()
def upload_image(note_id: UUID):
    try:
        if "image" not in request.files:
            return jsonify({"error": "Aucune image fournie"}), HTTPStatus.BAD_REQUEST

        file = request.files["image"]
        image_dto = note_image_service.upload_image(str(note_id), file)

        return (
            jsonify(image_dto.model_dump()),
            HTTPStatus.CREATED,
        )
    except NoteNotFound:
        return jsonify({"error": "Note introuvable"}), HTTPStatus.NOT_FOUND
    except ValueError as e:
        return jsonify({"error": str(e)}), HTTPStatus.BAD_REQUEST
    except Exception:
        return (
            jsonify({"error": "Erreur lors de l'upload de l'image"}),
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )


@swag_from(swagger_doc("notes/image_list.yaml"))
@bp_note_images.get("/<uuid:note_id>/images")
@jwt_required()
def list_images(note_id: UUID):
    try:
        images = note_image_service.list_images(str(note_id))
        return jsonify([img.model_dump() for img in images]), HTTPStatus.OK
    except NoteNotFound:
        return jsonify({"error": "Note introuvable"}), HTTPStatus.NOT_FOUND
    except Exception:
        return (
            jsonify({"error": "Erreur lors de la récupération des images"}),
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )


@swag_from(swagger_doc("notes/image_get.yaml"))
@bp_note_images.get("/<uuid:note_id>/images/<filename>")
@jwt_required()
def get_image(note_id: UUID, filename: str):
    try:
        filepath = os.path.join("uploads/notes", str(note_id), filename)

        if not os.path.exists(filepath):
            return jsonify({"error": "Image introuvable"}), HTTPStatus.NOT_FOUND

        return send_file(filepath, mimetype="image/jpeg")
    except Exception:
        return (
            jsonify({"error": "Erreur lors de la récupération de l'image"}),
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )


@swag_from(swagger_doc("notes/image_delete.yaml"))
@bp_note_images.delete("/<uuid:note_id>/images/<filename>")
@jwt_required()
def delete_image(note_id: UUID, filename: str):
    try:
        note_image_service.delete_image(str(note_id), filename)
        return "", HTTPStatus.NO_CONTENT
    except NoteNotFound:
        return jsonify({"error": "Note introuvable"}), HTTPStatus.NOT_FOUND
    except ValueError as e:
        return jsonify({"error": str(e)}), HTTPStatus.NOT_FOUND
    except Exception:
        return (
            jsonify({"error": "Erreur lors de la suppression de l'image"}),
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )

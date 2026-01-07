import os
from flask import Blueprint, send_file
from flasgger import swag_from

from exceptions.upload_exception import (
    UploadsNotAvailable,
    UploadInvalidKey,
    UploadNotFound,
)
from utils.storage import StorageError, get_storage_client

bp_uploads = Blueprint("uploads", __name__, url_prefix="/uploads")


@bp_uploads.get("/<path:key>")
@swag_from("../docs/uploads/serve_upload.yaml")
def serve_upload(key: str):
    """Serve files stored on the local driver."""
    storage = get_storage_client()
    if getattr(storage, "driver", None) != "local":
        raise UploadsNotAvailable()

    try:
        path = storage.resolve_local_path(key)
    except StorageError as e:
        raise UploadInvalidKey() from e

    if not path:
        raise UploadInvalidKey()

    if not os.path.isfile(path):
        raise UploadNotFound()

    return send_file(path)

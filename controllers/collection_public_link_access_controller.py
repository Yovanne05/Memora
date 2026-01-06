from http import HTTPStatus

from flask import Blueprint, jsonify
from flasgger import swag_from

from services.impl.shared_service_impl import shared_service

bp_collection_public_links_access = Blueprint(
    "collection_public_links_access",
    __name__,
    url_prefix="/collection-public-links",
)


@bp_collection_public_links_access.get("/<link_id>")
@swag_from("../docs/shared/get_collection.yaml")
def get_collection(link_id: str):
    collection_dto = shared_service.get_collection_by_token(link_id)
    return jsonify(collection_dto.model_dump()), HTTPStatus.OK

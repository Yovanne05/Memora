from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify
from flasgger import swag_from

from services.impl.favorite.collection_favorite_service_impl import (
    collection_favorite_service,
)

bp_collection_favorites = Blueprint(
    "collection_favorites",
    __name__,
    url_prefix="/collections/<uuid:collection_id>/favorites",
)


@bp_collection_favorites.post("")
@swag_from("../docs/collections/favorite_add.yaml")
def add_favorite(collection_id: UUID):
    favorite = collection_favorite_service.add_favorite(str(collection_id))
    return jsonify(favorite.model_dump()), HTTPStatus.CREATED


@bp_collection_favorites.delete("")
@swag_from("../docs/collections/favorite_delete.yaml")
def remove_favorite(collection_id: UUID):
    collection_favorite_service.remove_favorite(str(collection_id))
    return "", HTTPStatus.NO_CONTENT

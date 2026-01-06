from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flasgger import swag_from

from dtos.collection_dto import (
    CollectionCreateDTO,
    CollectionUpdateDTO,
)
from querys.collection_query import CollectionFindQuery
from services.impl.collection.collection_service_impl import collection_service
from services.impl.favorite.collection_favorite_service_impl import (
    collection_favorite_service,
)

bp_collections = Blueprint(
    "collections", __name__, url_prefix="/collections"
)


@bp_collections.get("")
@swag_from("../docs/collections/list.yaml")
def find_many():
    raw_query = request.args.to_dict(flat=True)
    query = CollectionFindQuery.model_validate(raw_query)
    params = query.to_params()

    collection_dtos, total = collection_service.find_many(params)
    return (
        jsonify(
            {
                "items": [dto.model_dump() for dto in collection_dtos],
                "total": total,
            }
        ),
        HTTPStatus.OK,
    )


@bp_collections.get("/<uuid:collection_id>")
@swag_from("../docs/collections/find_one.yaml")
def find_one(collection_id: UUID):
    collection = collection_service.find_one(str(collection_id))
    return jsonify(collection.model_dump()), HTTPStatus.OK


@bp_collections.post("")
@swag_from("../docs/collections/create.yaml")
def create():
    payload = CollectionCreateDTO.model_validate_json(request.data)
    collection = collection_service.create(payload)
    return jsonify(collection.model_dump()), HTTPStatus.CREATED


@bp_collections.patch("/<uuid:collection_id>")
@swag_from("../docs/collections/update.yaml")
def update(collection_id: UUID):
    payload = CollectionUpdateDTO.model_validate_json(request.data)
    collection = collection_service.update(str(collection_id), payload)
    return jsonify(collection.model_dump()), HTTPStatus.OK


@bp_collections.delete("/<uuid:collection_id>")
@swag_from("../docs/collections/delete.yaml")
def delete(collection_id: UUID):
    collection_service.delete(str(collection_id))
    return "", HTTPStatus.NO_CONTENT


@bp_collections.post("/<uuid:collection_id>/favorites")
@swag_from("../docs/collections/favorite_add.yaml")
def add_favorite(collection_id: UUID):
    favorite = collection_favorite_service.add_favorite(str(collection_id))
    return jsonify(favorite.model_dump()), HTTPStatus.CREATED


@bp_collections.delete("/<uuid:collection_id>/favorites")
@swag_from("../docs/collections/favorite_delete.yaml")
def remove_favorite(collection_id: UUID):
    collection_favorite_service.remove_favorite(str(collection_id))
    return "", HTTPStatus.NO_CONTENT

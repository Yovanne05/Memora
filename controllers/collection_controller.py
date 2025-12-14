from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from flasgger import swag_from

from dtos.collection_dto import (
    CollectionCreateDTO,
    CollectionUpdateDTO,
)
from dtos.collection_share_dto import (
    CollectionShareCreateDTO,
    CollectionShareUpdateDTO,
)
from querys.collection_query import CollectionFindQuery
from services.impl.collection.collection_service_impl import CollectionService
from services.impl.collection.collection_share_service_impl import (
    collection_share_service,
)

collection_service = CollectionService()

bp_collections = Blueprint(
    "collections", __name__, url_prefix="/collections"
)


@swag_from("docs/collections/list.yaml")
@bp_collections.get("")
@jwt_required()
def find_many() :
    raw_query = request.args.to_dict(flat=True)
    query = CollectionFindQuery.model_validate(raw_query)
    params = query.to_params()

    collection_dtos, total = collection_service.find_many(params)
    return (
        jsonify(
            {
                "items" : [dto.model_dump() for dto in collection_dtos],
                "total" : total,
            }
        ),
        HTTPStatus.OK,
    )


@swag_from("docs/collections/find_one.yaml")
@bp_collections.get("/<uuid:collection_id>")
@jwt_required()
def find_one(collection_id : UUID) :
    collection = collection_service.find_one(str(collection_id))
    return jsonify(collection.model_dump()), HTTPStatus.OK


@swag_from("docs/collections/create.yaml")
@bp_collections.post("")
@jwt_required()
def create() :
    payload = CollectionCreateDTO.model_validate_json(request.data)
    collection = collection_service.create(payload)
    return jsonify(collection.model_dump()), HTTPStatus.CREATED


@swag_from("docs/collections/update.yaml")
@bp_collections.patch("/<uuid:collection_id>")
@jwt_required()
def update(collection_id : UUID) :
    payload = CollectionUpdateDTO.model_validate_json(request.data)
    collection = collection_service.update(str(collection_id), payload)
    return jsonify(collection.model_dump()), HTTPStatus.OK


@swag_from("docs/collections/delete.yaml")
@bp_collections.delete("/<uuid:collection_id>")
@jwt_required()
def delete(collection_id : UUID):
    collection_service.delete(str(collection_id))
    return "", HTTPStatus.NO_CONTENT


@swag_from("docs/collections/share_list.yaml")
@bp_collections.get("/<uuid:collection_id>/shares")
@jwt_required()
def list_shares(collection_id: UUID):
    share_dtos = collection_share_service.list_shares(str(collection_id))
    return (
        jsonify(
            {
                "items": [dto.model_dump() for dto in share_dtos],
                "total": len(share_dtos),
            }
        ),
        HTTPStatus.OK,
    )


@swag_from("docs/collections/share_create.yaml")
@bp_collections.post("/<uuid:collection_id>/shares")
@jwt_required()
def share_collection(collection_id: UUID):
    payload = CollectionShareCreateDTO.model_validate_json(request.data)
    share_dto = collection_share_service.share_collection(
        str(collection_id), payload
    )
    return jsonify(share_dto.model_dump()), HTTPStatus.CREATED


@swag_from("docs/collections/share_update.yaml")
@bp_collections.patch("/<uuid:collection_id>/shares/<uuid:user_id>")
@jwt_required()
def update_share(collection_id: UUID, user_id: UUID):
    payload = CollectionShareUpdateDTO.model_validate_json(request.data)
    share_dto = collection_share_service.update_share(
        str(collection_id), str(user_id), payload
    )
    return jsonify(share_dto.model_dump()), HTTPStatus.OK


@swag_from("docs/collections/share_delete.yaml")
@bp_collections.delete("/<uuid:collection_id>/shares/<uuid:user_id>")
@jwt_required()
def revoke_share(collection_id: UUID, user_id: UUID):
    collection_share_service.revoke_share(str(collection_id), str(user_id))
    return "", HTTPStatus.NO_CONTENT

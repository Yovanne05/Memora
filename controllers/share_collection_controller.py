from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from flasgger import swag_from

from dtos.collection_share_dto import (
    CollectionShareCreateDTO,
    CollectionShareUpdateDTO,
)
from services.impl.collection.collection_share_service_impl import (
    collection_share_service,
)
from utils.swagger import swagger_doc

bp_collection_shares = Blueprint(
    "collection_shares", __name__, url_prefix="/collections"
)


@swag_from(swagger_doc("collections/share_list.yaml"))
@bp_collection_shares.get("/<uuid:collection_id>/shares")
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


@swag_from(swagger_doc("collections/share_create.yaml"))
@bp_collection_shares.post("/<uuid:collection_id>/shares")
@jwt_required()
def share_collection(collection_id: UUID):
    payload = CollectionShareCreateDTO.model_validate_json(request.data)
    share_dto = collection_share_service.share_collection(
        str(collection_id), payload
    )
    return jsonify(share_dto.model_dump()), HTTPStatus.CREATED


@swag_from(swagger_doc("collections/share_update.yaml"))
@bp_collection_shares.patch("/<uuid:collection_id>/shares/<uuid:user_id>")
@jwt_required()
def update_share(collection_id: UUID, user_id: UUID):
    payload = CollectionShareUpdateDTO.model_validate_json(request.data)
    share_dto = collection_share_service.update_share(
        str(collection_id), str(user_id), payload
    )
    return jsonify(share_dto.model_dump()), HTTPStatus.OK


@swag_from(swagger_doc("collections/share_delete.yaml"))
@bp_collection_shares.delete("/<uuid:collection_id>/shares/<uuid:user_id>")
@jwt_required()
def revoke_share(collection_id: UUID, user_id: UUID):
    collection_share_service.revoke_share(str(collection_id), str(user_id))
    return "", HTTPStatus.NO_CONTENT

from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from flasgger import swag_from

from dtos.collection_share_link_dto import CollectionShareLinkCreateDTO
from querys.collection_share_link_query import CollectionShareLinkFindQuery
from services.impl.collection.collection_share_link_service_impl import (
    collection_share_link_service,
)

bp_collection_public_links = Blueprint(
    "collection_public_links",
    __name__,
    url_prefix="/collections/<uuid:collection_id>/public-links",
)


@bp_collection_public_links.get("")
@jwt_required()
@swag_from("../docs/collection_public_links/list.yaml")
def find_many(collection_id: UUID):
    raw_query = request.args.to_dict(flat=True)
    raw_query["collectionId"] = str(collection_id)
    query = CollectionShareLinkFindQuery.model_validate(raw_query)
    params = query.to_params()

    share_link_dtos, total = collection_share_link_service.find_many(params)
    return (
        jsonify(
            {"items": [dto.model_dump() for dto in share_link_dtos], "total": total}
        ),
        HTTPStatus.OK,
    )


@bp_collection_public_links.post("")
@jwt_required()
@swag_from("../docs/collection_public_links/create.yaml")
def create(collection_id: UUID):
    payload = CollectionShareLinkCreateDTO.model_validate_json(request.data)
    share_link_dto = collection_share_link_service.create_share_link(
        str(collection_id), payload
    )
    return jsonify(share_link_dto.model_dump()), HTTPStatus.CREATED


@bp_collection_public_links.delete("/<uuid:link_id>")
@jwt_required()
@swag_from("../docs/collection_public_links/delete.yaml")
def delete(collection_id: UUID, link_id: UUID):
    collection_share_link_service.delete_share_link(str(collection_id), str(link_id))
    return "", HTTPStatus.NO_CONTENT

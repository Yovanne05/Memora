from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flasgger import swag_from

from dtos.collection_share_dto import (
    CollectionShareCreateDTO,
    CollectionShareUpdateDTO,
)
from querys.collection_share_query import CollectionShareFindQuery
from services.impl.collection.collection_share_service_impl import (
    collection_share_service,
)

bp_collection_shares = Blueprint(
    "collection_shares",
    __name__,
    url_prefix="/collections/<uuid:collection_id>/shares",
)


@bp_collection_shares.get("")
@swag_from("../docs/shares_collections/share_list.yaml")
def find_many(collection_id: UUID):
    raw_query = request.args.to_dict(flat=True)
    raw_query["collectionId"] = str(collection_id)
    query = CollectionShareFindQuery.model_validate(raw_query)
    params = query.to_params()

    share_dtos, total = collection_share_service.find_many(params)
    return (
        jsonify({"items": [dto.model_dump() for dto in share_dtos], "total": total}),
        HTTPStatus.OK,
    )


@bp_collection_shares.post("")
@swag_from("../docs/shares_collections/share_create.yaml")
def create(collection_id: UUID):
    payload = CollectionShareCreateDTO.model_validate_json(request.data)
    share_dto = collection_share_service.share_collection(
        str(collection_id), payload
    )
    return jsonify(share_dto.model_dump()), HTTPStatus.CREATED


@bp_collection_shares.patch("/<uuid:user_id>")
@swag_from("../docs/shares_collections/share_update.yaml")
def update(collection_id: UUID, user_id: UUID):
    payload = CollectionShareUpdateDTO.model_validate_json(request.data)
    share_dto = collection_share_service.update_share(
        str(collection_id), str(user_id), payload
    )
    return jsonify(share_dto.model_dump()), HTTPStatus.OK


@bp_collection_shares.delete("/<uuid:user_id>")
@swag_from("../docs/shares_collections/share_delete.yaml")
def delete(collection_id: UUID, user_id: UUID):
    collection_share_service.revoke_share(str(collection_id), str(user_id))
    return "", HTTPStatus.NO_CONTENT

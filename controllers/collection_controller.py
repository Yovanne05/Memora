from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flasgger import swag_from

from dtos.collection_dto import (
    CollectionCreateDTO,
    CollectionUpdateDTO,
)
from dtos.tag_assignment_dto import TagAssignmentDTO
from querys.collection_query import CollectionFindQuery
from services.impl.collection.collection_service_impl import CollectionService
from services.impl.collection.collection_tag_service_impl import collection_tag_service

collection_service = CollectionService()

bp_collections = Blueprint(
    "collections", __name__, url_prefix="/collections"
)


@swag_from("../docs/collections/list.yaml")
@bp_collections.get("")
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


@swag_from("../docs/collections/find_one.yaml")
@bp_collections.get("/<uuid:collection_id>")
def find_one(collection_id : UUID) :
    collection = collection_service.find_one(str(collection_id))
    return jsonify(collection.model_dump()), HTTPStatus.OK


@swag_from("../docs/collections/create.yaml")
@bp_collections.post("")
def create() :
    payload = CollectionCreateDTO.model_validate_json(request.data)
    collection = collection_service.create(payload)
    return jsonify(collection.model_dump()), HTTPStatus.CREATED


@swag_from("../docs/collections/update.yaml")
@bp_collections.put("/<uuid:collection_id>")
def update(collection_id : UUID) :
    payload = CollectionUpdateDTO.model_validate_json(request.data)
    collection = collection_service.update(str(collection_id), payload)
    return jsonify(collection.model_dump()), HTTPStatus.OK


@swag_from("../docs/collections/delete.yaml")
@bp_collections.delete("/<uuid:collection_id>")
def delete(collection_id : UUID):
    collection_service.delete(str(collection_id))
    return "", HTTPStatus.NO_CONTENT


@swag_from("../docs/collections/tags_list.yaml")
@bp_collections.get("/<uuid:collection_id>/tags")
def list_collection_tags(collection_id: UUID):
    tag_dtos = collection_tag_service.list_tags(str(collection_id))
    return (
        jsonify(
            {
                "items": [dto.model_dump() for dto in tag_dtos],
                "total": len(tag_dtos),
            }
        ),
        HTTPStatus.OK,
    )


@swag_from("../docs/collections/tags_replace.yaml")
@bp_collections.put("/<uuid:collection_id>/tags")
def replace_collection_tags(collection_id: UUID):
    payload = TagAssignmentDTO.model_validate_json(request.data)
    tag_dtos = collection_tag_service.replace_tags(str(collection_id), payload)
    return (
        jsonify(
            {
                "items": [dto.model_dump() for dto in tag_dtos],
                "total": len(tag_dtos),
            }
        ),
        HTTPStatus.OK,
    )

from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flasgger import swag_from

from dtos.tag_dto import TagCreateDTO, TagUpdateDTO
from querys.tag_query import TagFindQuery
from services.impl.tag_service_impl import tag_service

bp_tags = Blueprint("tags", __name__, url_prefix="/tags")


@swag_from("../docs/tags/list.yaml")
@bp_tags.get("")
def find_many():
    raw_query = request.args.to_dict(flat=True)
    query = TagFindQuery.model_validate(raw_query)
    params = query.to_params()

    tag_dtos, total = tag_service.find_many(params)
    return (
        jsonify({"items": [dto.model_dump() for dto in tag_dtos], "total": total}),
        HTTPStatus.OK,
    )


@swag_from("../docs/tags/find_one.yaml")
@bp_tags.get("/<uuid:tag_id>")
def find_one(tag_id: UUID):
    tag = tag_service.find_one(str(tag_id))
    return jsonify(tag.model_dump()), HTTPStatus.OK


@swag_from("../docs/tags/create.yaml")
@bp_tags.post("")
def create():
    payload = TagCreateDTO.model_validate_json(request.data)
    tag = tag_service.create(payload)
    return jsonify(tag.model_dump()), HTTPStatus.CREATED


@swag_from("../docs/tags/update.yaml")
@bp_tags.patch("/<uuid:tag_id>")
def update(tag_id: UUID):
    payload = TagUpdateDTO.model_validate_json(request.data)
    tag = tag_service.update(str(tag_id), payload)
    return jsonify(tag.model_dump()), HTTPStatus.OK


@swag_from("../docs/tags/delete.yaml")
@bp_tags.delete("/<uuid:tag_id>")
def delete(tag_id: UUID):
    tag_service.delete(str(tag_id))
    return "", HTTPStatus.NO_CONTENT

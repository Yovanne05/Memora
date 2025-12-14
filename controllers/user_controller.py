from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flasgger import swag_from

from dtos.user_dto import UserCreateDTO, UserUpdateDTO
from querys.user_query import UserFindQuery
from services.impl.user_service_impl import user_service

bp_users = Blueprint("users", __name__, url_prefix="/users")


@bp_users.get("")
@swag_from("../docs/users/list.yaml")
def find_many():
    raw_query = request.args.to_dict(flat=True)
    query = UserFindQuery.model_validate(raw_query)
    params = query.to_params()

    user_dtos, total = user_service.find_many(params)
    return (
        jsonify(
            {"items": [dto.model_dump() for dto in user_dtos], "total": total}
        ),
        HTTPStatus.OK,
    )


@bp_users.get("/<uuid:user_id>")
@swag_from("../docs/users/find_one.yaml")
def find_one(user_id: UUID):
    user = user_service.find_one(str(user_id))
    return jsonify(user.model_dump()), HTTPStatus.OK


@bp_users.post("")
@swag_from("../docs/users/create.yaml")
def create():
    payload = UserCreateDTO.model_validate_json(request.data)
    user = user_service.create(payload)
    return jsonify(user.model_dump()), HTTPStatus.CREATED


@bp_users.patch("/<uuid:user_id>")
@swag_from("../docs/users/update.yaml")
def patch(user_id: UUID):
    payload = UserUpdateDTO.model_validate_json(request.data)
    user = user_service.update(str(user_id), payload)
    return jsonify(user.model_dump()), HTTPStatus.OK


@bp_users.delete("/<uuid:user_id>")
@swag_from("../docs/users/delete.yaml")
def delete(user_id: UUID):
    user_service.delete(str(user_id))
    return "", HTTPStatus.NO_CONTENT

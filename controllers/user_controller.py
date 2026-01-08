from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from flasgger import swag_from

from dtos.auth_dto import RegisterDTO
from dtos.user_dto import UserCreateDTO, UserUpdateDTO
from dtos.common_dto import ListResponseDTO
from querys.user_query import UserFindQuery
from services.impl.auth_service_impl import auth_service
from services.impl.user_service_impl import user_service
from utils.enums import RoleEnum

bp_users = Blueprint("users", __name__, url_prefix="/users")


@bp_users.get("")
@jwt_required()
@swag_from("../docs/users/list.yaml")
def find_many():
    raw_query = request.args.to_dict(flat=True)
    query = UserFindQuery.model_validate(raw_query)
    params = query.to_params()

    user_dtos, total = user_service.find_many(params)
    response = ListResponseDTO(
        items=[dto.model_dump() for dto in user_dtos],
        total=total
    )
    return jsonify(response.model_dump()), HTTPStatus.OK


@bp_users.get("/<uuid:user_id>")
@jwt_required()
@swag_from("../docs/users/find_one.yaml")
def find_one(user_id: UUID):
    user = user_service.find_one(str(user_id))
    return jsonify(user.model_dump()), HTTPStatus.OK


@bp_users.post("")
@swag_from("../docs/users/create.yaml")
def create():
    payload = RegisterDTO.model_validate_json(request.data)
    user_create = UserCreateDTO(
        email=payload.email,
        password=payload.password,
        username=payload.username,
        display_name=payload.display_name,
        role=RoleEnum.CLIENT,
    )
    user = user_service.create(user_create)
    return jsonify(user.model_dump()), HTTPStatus.CREATED


@bp_users.patch("/<uuid:user_id>")
@jwt_required()
@swag_from("../docs/users/update.yaml")
def update(user_id: UUID):
    payload = UserUpdateDTO.model_validate_json(request.data)
    user = user_service.update(str(user_id), payload)
    return jsonify(user.model_dump()), HTTPStatus.OK


@bp_users.delete("/<uuid:user_id>")
@jwt_required()
@swag_from("../docs/users/delete.yaml")
def delete(user_id: UUID):
    user_service.delete(str(user_id))
    return "", HTTPStatus.NO_CONTENT

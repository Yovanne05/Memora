from http import HTTPStatus

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from flasgger import swag_from

from dtos.auth_dto import LoginDTO, RegisterDTO
from services.impl.auth_service_impl import auth_service
from utils.auth import get_current_user

bp_auth = Blueprint("auth", __name__, url_prefix="/auth")


@bp_auth.post("/register")
@swag_from("../docs/auth/register.yaml")
def register():
    payload = RegisterDTO.model_validate_json(request.data)
    user, token = auth_service.register(payload)
    return (
        jsonify({"user": user.model_dump(), "access_token": token}),
        HTTPStatus.CREATED,
    )


@bp_auth.post("/login")
@swag_from("../docs/auth/login.yaml")
def login():
    payload = LoginDTO.model_validate_json(request.data)
    user, token = auth_service.login(payload)
    return jsonify({"user": user.model_dump(), "access_token": token}), HTTPStatus.OK


@jwt_required()
@bp_auth.get("/me")
@swag_from("../docs/auth/me.yaml")
def me():
    user = get_current_user()
    user_dto = auth_service.get_me(user.id)
    return jsonify({"user": user_dto.model_dump()}), HTTPStatus.OK

from http import HTTPStatus

import config
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flasgger import swag_from

from dtos.auth_dto import LoginDTO, RegisterDTO
from services.impl.auth_service_impl import auth_service
from utils.swagger import swagger_doc
from utils.limiter import limiter

bp_auth = Blueprint("auth", __name__, url_prefix="/auth")


@swag_from(swagger_doc("auth/register.yaml"))
@bp_auth.post("/register")
def register():
    payload = RegisterDTO.model_validate_json(request.data)
    user, token = auth_service.register(payload)
    return (
        jsonify({"user": user.model_dump(), "access_token": token}),
        HTTPStatus.CREATED,
    )


@bp_auth.post("/login")
@limiter.limit(config.LOGIN_RATE_LIMIT)
@swag_from(swagger_doc("auth/login.yaml"))
def login():
    payload = LoginDTO.model_validate_json(request.data)
    user, token = auth_service.login(payload)
    return jsonify({"user": user.model_dump(), "access_token": token}), HTTPStatus.OK


@swag_from(swagger_doc("auth/me.yaml"))
@bp_auth.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = auth_service.get_me(str(user_id))
    return jsonify({"user": user.model_dump()}), HTTPStatus.OK


@swag_from(swagger_doc("auth/logout.yaml"))
@bp_auth.post("/logout")
@jwt_required()
def logout():
    return "", HTTPStatus.NO_CONTENT

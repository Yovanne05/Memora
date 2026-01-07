from http import HTTPStatus

from flask_jwt_extended import get_jwt_identity, jwt_required

from flask import Blueprint, jsonify, request
from flasgger import swag_from

from dtos.auth_dto import AuthMeResponseDTO, AuthResponseDTO, LoginDTO
from services.impl.auth_service_impl import auth_service

bp_sessions = Blueprint("sessions", __name__, url_prefix="/sessions")


@bp_sessions.post("")
@swag_from("../docs/auth/login.yaml")
def create_session():
    payload = LoginDTO.model_validate_json(request.data)
    user, token = auth_service.login(payload)
    response = AuthResponseDTO(user=user, access_token=token)
    return jsonify(response.model_dump()), HTTPStatus.OK


@bp_sessions.get("/me")
@jwt_required()
@swag_from("../docs/auth/me.yaml")
def me():
    user_id = get_jwt_identity()
    user_dto = auth_service.get_me(user_id)
    response = AuthMeResponseDTO(user=user_dto)
    return jsonify(response.model_dump()), HTTPStatus.OK
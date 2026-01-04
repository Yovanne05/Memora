from http import HTTPStatus

from flask import Blueprint, jsonify
from flasgger import swag_from

from services.impl.user_statistics_service_impl import user_statistics_service
from utils.auth import get_current_user

bp_user_statistics = Blueprint(
    "user_statistics", __name__, url_prefix="/users/me"
)


@bp_user_statistics.get("/statistics")
@swag_from("../docs/users/statistics.yaml")
def get_statistics():
    user = get_current_user()
    stats = user_statistics_service.get_statistics(user.id)
    return jsonify(stats.model_dump(by_alias=True)), HTTPStatus.OK

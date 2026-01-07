from http import HTTPStatus

from flask import Blueprint, jsonify, request
from flasgger import swag_from

from querys.user_statistics_query import UserStatisticsTimeSeriesQuery
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
    return jsonify(stats.model_dump()), HTTPStatus.OK


@bp_user_statistics.get("/statistics/timeseries")
@swag_from("../docs/users/statistics_timeseries.yaml")
def get_statistics_timeseries():
    user = get_current_user()

    # Validation Pydantic via Query DTO (pas de try/except nécessaire)
    raw_query = request.args.to_dict(flat=True)
    query = UserStatisticsTimeSeriesQuery.model_validate(raw_query)

    timeseries = user_statistics_service.get_timeseries(
        user.id, query.metric, query.days
    )
    return jsonify(timeseries.model_dump(mode='json')), HTTPStatus.OK

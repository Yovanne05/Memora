from http import HTTPStatus

from flask import Blueprint, jsonify, request
from flasgger import swag_from

from dtos.review_dto import ReviewCreateDTO
from services.impl.review_service_impl import review_service
from utils.auth import get_current_user

bp_reviews = Blueprint("reviews", __name__, url_prefix="/reviews")


@bp_reviews.post("")
@swag_from("../docs/reviews/create.yaml")
def create_review():
    user = get_current_user()
    payload = ReviewCreateDTO.model_validate_json(request.data)

    review_dto = review_service.submit_review(
        user_id=user.id,
        flashcard_id=payload.flashcard_id,
        selected_answer_id=payload.selected_answer_id,
        difficulty=payload.difficulty.value,
    )

    return jsonify(review_dto.model_dump(by_alias=True)), HTTPStatus.CREATED


@bp_reviews.get("/upcoming")
@swag_from("../docs/reviews/upcoming.yaml")
def get_upcoming():
    user = get_current_user()
    upcoming = review_service.get_upcoming_reviews(user.id)

    return (
        jsonify([group.model_dump(by_alias=True) for group in upcoming]),
        HTTPStatus.OK,
    )

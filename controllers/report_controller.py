from http import HTTPStatus
from uuid import UUID

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from flasgger import swag_from

from dtos.report_dto import ReportCreateDTO, ReportUpdateDTO
from querys.report_query import ReportFindQuery
from services.impl.report_service_impl import report_service

bp_reports = Blueprint("reports", __name__)


@bp_reports.post("/notes/<uuid:note_id>/reports")
@jwt_required()
@swag_from("../docs/reports/report_note.yaml")
def report_note(note_id: UUID):
    payload = ReportCreateDTO.model_validate_json(request.data)
    report = report_service.report_note(str(note_id), payload)
    return jsonify(report.model_dump(by_alias=True)), HTTPStatus.CREATED


@bp_reports.post("/collections/<uuid:collection_id>/reports")
@jwt_required()
@swag_from("../docs/reports/report_collection.yaml")
def report_collection(collection_id: UUID):
    payload = ReportCreateDTO.model_validate_json(request.data)
    report = report_service.report_collection(str(collection_id), payload)
    return jsonify(report.model_dump(by_alias=True)), HTTPStatus.CREATED


@bp_reports.get("/reports")
@jwt_required()
@swag_from("../docs/reports/list.yaml")
def list_reports():
    raw_query = request.args.to_dict(flat=True)
    query = ReportFindQuery.model_validate(raw_query)
    params = query.to_params()

    reports, total = report_service.find_many(params)
    return (
        jsonify(
            {
                "items": [report.model_dump(by_alias=True) for report in reports],
                "total": total,
            }
        ),
        HTTPStatus.OK,
    )


@bp_reports.get("/reports/<uuid:report_id>")
@jwt_required()
@swag_from("../docs/reports/find_one.yaml")
def get_report(report_id: UUID):
    report = report_service.find_one(str(report_id))
    return jsonify(report.model_dump(by_alias=True)), HTTPStatus.OK


@bp_reports.patch("/reports/<uuid:report_id>")
@jwt_required()
@swag_from("../docs/reports/update.yaml")
def update_report(report_id: UUID):
    payload = ReportUpdateDTO.model_validate_json(request.data)
    report = report_service.update(str(report_id), payload)
    return jsonify(report.model_dump(by_alias=True)), HTTPStatus.OK

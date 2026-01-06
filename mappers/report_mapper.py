from sqlalchemy import inspect

from daos.report_dao import Report
from dtos.report_dto import ReportDTO
from utils.enums import ReportTargetEnum


def _safe_note_title(report: Report) -> str | None:
    insp = inspect(report)
    if "note" in insp.unloaded:
        return None
    return report.note.title if report.note else None


def _safe_collection_name(report: Report) -> str | None:
    insp = inspect(report)
    if "collection" in insp.unloaded:
        return None
    return report.collection.name if report.collection else None


def _safe_reporter_email(report: Report) -> str | None:
    insp = inspect(report)
    if "reporter" in insp.unloaded:
        return None
    return report.reporter.email if report.reporter else None


def report_to_dto(report: Report) -> ReportDTO:
    target_type = (
        ReportTargetEnum.NOTE
        if report.note_id is not None
        else ReportTargetEnum.COLLECTION
    )
    data = {
        "id": report.id,
        "target_type": target_type,
        "note_id": report.note_id,
        "collection_id": report.collection_id,
        "reason": report.reason,
        "status": report.status,
        "description": report.description,
        "reporter_id": report.reporter_id,
        "reporter_email": _safe_reporter_email(report),
        "note_title": _safe_note_title(report),
        "collection_name": _safe_collection_name(report),
        "created_at": report.created_at,
        "updated_at": report.updated_at,
    }
    return ReportDTO.model_validate(data)

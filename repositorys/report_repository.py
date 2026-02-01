from dataclasses import dataclass
from typing import List, Literal, Optional, Tuple

from sqlalchemy import func, select
from sqlalchemy.orm import joinedload, Session

from daos.report_dao import Report
from utils.db import get_db_session
from utils.enums import ReportReasonEnum, ReportStatusEnum, ReportTargetEnum


def _with_relationships(stmt):
    return stmt.options(
        joinedload(Report.note),
        joinedload(Report.collection),
        joinedload(Report.reporter),
    )


def _reload_with_relationships(session: Session, report_id: str) -> Report:
    stmt = _with_relationships(select(Report).where(Report.id == report_id))
    return session.execute(stmt).scalar_one()


@dataclass
class ReportSearchParams:
    status: ReportStatusEnum | None = None
    reason: ReportReasonEnum | None = None
    target_type: ReportTargetEnum | None = None
    reporter_id: Optional[str] = None
    note_id: Optional[str] = None
    collection_id: Optional[str] = None

    sort_by: Literal["created_at", "status"] = "created_at"
    sort_dir: Literal["asc", "desc"] = "desc"

    limit: int = 50
    offset: int = 0


def find_many(params: Optional[ReportSearchParams] = None) -> Tuple[List[Report], int]:
    p = params or ReportSearchParams()
    filters = []

    if p.status:
        filters.append(Report.status == p.status)
    if p.reason:
        filters.append(Report.reason == p.reason)
    if p.reporter_id:
        filters.append(Report.reporter_id == p.reporter_id)
    if p.note_id:
        filters.append(Report.note_id == p.note_id)
    if p.collection_id:
        filters.append(Report.collection_id == p.collection_id)
    if p.target_type == ReportTargetEnum.NOTE:
        filters.append(Report.note_id.isnot(None))
    if p.target_type == ReportTargetEnum.COLLECTION:
        filters.append(Report.collection_id.isnot(None))

    stmt = _with_relationships(select(Report).where(*filters))

    sort_map = {
        "created_at": Report.created_at,
        "status": Report.status,
    }
    order_column = sort_map[p.sort_by]
    order_expr = order_column.desc() if p.sort_dir == "desc" else order_column.asc()

    with get_db_session() as session:
        total = session.scalar(select(func.count()).select_from(stmt.subquery()))
        items = session.scalars(
            stmt.order_by(order_expr).limit(p.limit).offset(p.offset)
        ).all()

    return items, total or 0


def find_one(report_id: str) -> Optional[Report]:
    stmt = _with_relationships(select(Report).where(Report.id == report_id))
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def add(report: Report) -> Report:
    with get_db_session() as session:
        session.add(report)
        session.flush()
        session.refresh(report)
        return _reload_with_relationships(session, report.id)


def update(report: Report) -> Report:
    with get_db_session() as session:
        merged: Report = session.merge(report)
        session.flush()
        session.refresh(merged)
        return _reload_with_relationships(session, merged.id)

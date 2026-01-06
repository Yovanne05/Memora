from typing import Tuple

from daos.report_dao import Report
from domain_services.collection_domain_service import ensure_collection_exists
from domain_services.note_domain_service import ensure_note_exists
from domain_services.report_domain_service import (
    ensure_admin_user,
    ensure_can_report_collection,
    ensure_can_report_note,
    ensure_report_has_target,
)
from dtos.report_dto import ReportCreateDTO, ReportDTO, ReportUpdateDTO
from exceptions.report_exception import ReportNotFound
from mappers.report_mapper import report_to_dto
from repositorys import collection_repository, note_repository
from repositorys import report_repository
from repositorys.report_repository import ReportSearchParams
from services.impl.collection.collection_service_impl import collection_service
from services.impl.note.note_crud_service_impl import note_crud_service
from services.interfaces.report_service_interface import ReportServiceInterface
from utils.auth import get_current_user
from utils.enums import ReportStatusEnum, ReportActionEnum


class ReportService(ReportServiceInterface):
    def report_note(self, note_id: str, report_dto: ReportCreateDTO) -> ReportDTO:
        user = get_current_user()
        note_entity = note_repository.get_for_user(user, note_id)
        ensure_note_exists(note_entity)
        ensure_can_report_note(user, note_entity)

        report_entity = Report(
            note_id=note_entity.id,
            reporter_id=user.id,
            reason=report_dto.reason,
            description=report_dto.description,
            status=ReportStatusEnum.PENDING,
        )
        saved = report_repository.add(report_entity)
        return report_to_dto(saved)

    def report_collection(
        self, collection_id: str, report_dto: ReportCreateDTO
    ) -> ReportDTO:
        user = get_current_user()
        collection_entity = collection_repository.get_for_user(user, collection_id)
        ensure_collection_exists(collection_entity)
        ensure_can_report_collection(user, collection_entity)

        report_entity = Report(
            collection_id=collection_entity.id,
            reporter_id=user.id,
            reason=report_dto.reason,
            description=report_dto.description,
            status=ReportStatusEnum.PENDING,
        )
        saved = report_repository.add(report_entity)
        return report_to_dto(saved)

    def find_many(self, params: ReportSearchParams) -> Tuple[list[ReportDTO], int]:
        user = get_current_user()
        ensure_admin_user(user)

        reports, total = report_repository.find_many(params)
        return [report_to_dto(report) for report in reports], total

    def find_one(self, report_id: str) -> ReportDTO:
        user = get_current_user()
        ensure_admin_user(user)

        report_entity = report_repository.find_one(report_id)
        if not report_entity:
            raise ReportNotFound()
        return report_to_dto(report_entity)

    def update(self, report_id: str, update_dto: ReportUpdateDTO) -> ReportDTO:
        user = get_current_user()
        ensure_admin_user(user)

        report_entity = report_repository.find_one(report_id)
        if not report_entity:
            raise ReportNotFound()

        if update_dto.action == ReportActionEnum.DELETE_TARGET:
            ensure_report_has_target(report_entity)
            if report_entity.note_id:
                note_crud_service.delete(report_entity.note_id)
            elif report_entity.collection_id:
                collection_service.delete(report_entity.collection_id)

            report_entity.status = ReportStatusEnum.RESOLVED
        else:
            report_entity.status = update_dto.status
        saved = report_repository.update(report_entity)
        return report_to_dto(saved)


report_service = ReportService()

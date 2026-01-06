from typing import Protocol, Tuple

from dtos.report_dto import ReportCreateDTO, ReportDTO, ReportStatusUpdateDTO
from repositorys.report_repository import ReportSearchParams


class ReportServiceInterface(Protocol):
    def report_note(self, note_id: str, report_dto: ReportCreateDTO) -> ReportDTO:
        ...

    def report_collection(self, collection_id: str, report_dto: ReportCreateDTO) -> ReportDTO:
        ...

    def find_many(self, params: ReportSearchParams) -> Tuple[list[ReportDTO], int]:
        ...

    def find_one(self, report_id: str) -> ReportDTO:
        ...

    def update_status(self, report_id: str, status_dto: ReportStatusUpdateDTO) -> ReportDTO:
        ...

    def delete_target(self, report_id: str) -> ReportDTO:
        ...

from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from repositorys.report_repository import ReportSearchParams
from utils.enums import ReportReasonEnum, ReportStatusEnum, ReportTargetEnum


class ReportFindQuery(BaseModel):
    status: ReportStatusEnum | None = None
    reason: ReportReasonEnum | None = None
    target_type: ReportTargetEnum | None = Field(default=None)
    reporter_id: Optional[UUID] = Field(default=None)
    note_id: Optional[UUID] = Field(default=None)
    collection_id: Optional[UUID] = Field(default=None)

    sort_by: Literal["created_at", "status"] = Field(default="created_at")
    sort_dir: Literal["asc", "desc"] = Field(default="desc")

    limit: int = Field(default=50, ge=1, le=200)
    offset: int = Field(default=0, ge=0, le=10_000)

    def to_params(self) -> ReportSearchParams:
        return ReportSearchParams(
            status=self.status,
            reason=self.reason,
            target_type=self.target_type,
            reporter_id=str(self.reporter_id) if self.reporter_id else None,
            note_id=str(self.note_id) if self.note_id else None,
            collection_id=str(self.collection_id) if self.collection_id else None,
            sort_by=self.sort_by,
            sort_dir=self.sort_dir,
            limit=self.limit,
            offset=self.offset,
        )

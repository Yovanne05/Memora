from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from utils.enums import (
    ReportReasonEnum,
    ReportStatusEnum,
    ReportActionEnum,
    ReportTargetEnum,
)


class ReportCreateDTO(BaseModel):
    reason: ReportReasonEnum
    description: str | None = Field(default=None, max_length=2000)


class ReportUpdateDTO(BaseModel):
    status: ReportStatusEnum
    action: ReportActionEnum | None = None


class ReportDTO(BaseModel):
    id: str
    target_type: ReportTargetEnum
    note_id: str | None = None
    collection_id: str | None = None
    reason: ReportReasonEnum
    status: ReportStatusEnum
    description: str | None = None
    reporter_id: str
    reporter_email: str | None = None
    note_title: str | None = None
    collection_name: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

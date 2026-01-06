from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from utils.enums import (
    ReportReasonEnum,
    ReportStatusEnum,
    ReportTargetEnum,
)


class ReportCreateDTO(BaseModel):
    reason: ReportReasonEnum
    description: str | None = Field(default=None, max_length=2000)


class ReportStatusUpdateDTO(BaseModel):
    status: ReportStatusEnum


class ReportDTO(BaseModel):
    id: str
    target_type: ReportTargetEnum = Field(alias="targetType")
    note_id: str | None = Field(default=None, alias="noteId")
    collection_id: str | None = Field(default=None, alias="collectionId")
    reason: ReportReasonEnum
    status: ReportStatusEnum
    description: str | None = None
    reporter_id: str = Field(alias="reporterId")
    reporter_email: str | None = Field(default=None, alias="reporterEmail")
    note_title: str | None = Field(default=None, alias="noteTitle")
    collection_name: str | None = Field(default=None, alias="collectionName")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

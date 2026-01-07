from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator

from utils.enums import MetricEnum


class UserStatisticsTimeSeriesQuery(BaseModel):
    metric: MetricEnum = Field(default=MetricEnum.NOTES)
    days: Literal[7, 30, 90] = Field(default=30)

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("days", mode="before")
    @classmethod
    def parse_days(cls, value):
        """Convert string to int for query parameters."""
        if isinstance(value, str):
            return int(value)
        return value

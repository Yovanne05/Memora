from enum import Enum


class VisibilityEnum(str, Enum):
    PRIVATE = "private"
    PUBLIC = "public"


class SharePermissionEnum(str, Enum):
    READ = "read"
    WRITE = "write"


class RoleEnum(str, Enum):
    CLIENT = "client"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class ReviewDifficultyEnum(str, Enum):
    AGAIN = "again"
    HARD = "hard"
    GOOD = "good"
    EASY = "easy"


class ReportTargetEnum(str, Enum):
    NOTE = "note"
    COLLECTION = "collection"


class ReportReasonEnum(str, Enum):
    ILLEGAL_CONTENT = "illegal_content"
    SHOCKING_OR_INAPPROPRIATE = "shocking_or_inappropriate"
    HARASSMENT_OR_ABUSE = "harassment_or_abuse"
    RIGHTS_VIOLATION = "rights_violation"
    SPAM_OR_ABUSE = "spam_or_abuse"
    TECHNICAL_ISSUE = "technical_issue"
    OTHER = "other"


class ReportStatusEnum(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"

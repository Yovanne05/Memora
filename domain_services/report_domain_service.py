from daos.collection_dao import Collection
from daos.note_dao import Note
from daos.report_dao import Report
from exceptions.report_exception import (
    ReportForbidden,
    ReportInvalidTarget,
    ReportTargetActionForbidden,
)
from utils.access_scope import can_read_collection, can_read_note
from utils.enums import RoleEnum


def ensure_admin_user(user):
    """Raise if the current user is not an admin."""
    if user.role not in {RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN}:
        raise ReportForbidden("Admin permissions are required to manage reports.")
    return user


def ensure_report_target_exists(note: Note | None, collection: Collection | None):
    if not note and not collection:
        raise ReportInvalidTarget()
    return note or collection


def ensure_can_report_note(user, note: Note):
    ensure_report_target_exists(note, None)
    if not can_read_note(user, note.id):
        raise ReportForbidden("You cannot report this note.")
    return note


def ensure_can_report_collection(user, collection: Collection):
    ensure_report_target_exists(None, collection)
    if not can_read_collection(user, collection.id):
        raise ReportForbidden("You cannot report this collection.")
    return collection


def ensure_report_has_target(report: Report) -> Report:
    if not report.note_id and not report.collection_id:
        raise ReportTargetActionForbidden()
    return report

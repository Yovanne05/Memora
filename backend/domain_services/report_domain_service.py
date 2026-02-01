from daos.collection_dao import Collection
from daos.note_dao import Note
from daos.report_dao import Report
from exceptions.report_exception import (
    ReportForbidden,
    ReportInvalidTarget,
    ReportTargetActionForbidden,
)
from utils.enums import RoleEnum
from domain_services.permission_domain_service import permission_domain_service


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
    if not permission_domain_service.can_read_note(note.id, user.id, user.role):
        raise ReportForbidden("You cannot report this note.")
    return note


def ensure_can_report_collection(user, collection: Collection):
    ensure_report_target_exists(None, collection)
    if not permission_domain_service.can_read_collection(collection.id, user.id, user.role):
        raise ReportForbidden("You cannot report this collection.")
    return collection


def ensure_report_has_target(report: Report) -> Report:
    if not report.note_id and not report.collection_id:
        raise ReportTargetActionForbidden()
    return report

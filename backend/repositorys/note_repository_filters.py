from dataclasses import dataclass
from typing import TYPE_CHECKING

from daos.note_dao import Note
from repositorys.note_favorite_repository import favorite_note_ids_for_user

if TYPE_CHECKING:
    from repositorys.note_repository import NoteSearchParams


@dataclass
class NoteFilterResult:
    filters: list
    force_empty: bool = False


def build_note_filters(user, params: "NoteSearchParams") -> NoteFilterResult:
    filters = []

    if params.collection_id:
        filters.append(Note.collection_id == params.collection_id)

    if params.visibility:
        filters.append(Note.visibility == params.visibility)

    if params.title_contains:
        filters.append(Note.title.ilike(f"%{params.title_contains}%"))

    if params.ids:
        filters.append(Note.id.in_(params.ids))

    if params.tags:
        for tag in params.tags:
            filters.append(Note.tags.contains([tag]))

    if params.is_favorite:
        favorite_ids = favorite_note_ids_for_user(user.id)
        if not favorite_ids:
            return NoteFilterResult(filters=[], force_empty=True)
        filters.append(Note.id.in_(favorite_ids))

    return NoteFilterResult(filters=filters)


def build_note_order(params: "NoteSearchParams"):
    sort_map = {
        "title": Note.title,
        "created_at": Note.created_at,
        "updated_at": Note.updated_at,
    }
    order_column = sort_map[params.sort_by]
    return order_column.desc() if params.sort_dir == "desc" else order_column.asc()

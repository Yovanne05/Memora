from dataclasses import dataclass
from typing import TYPE_CHECKING

from sqlalchemy import select

from daos.collection_dao import Collection
from daos.note_dao import Note
from repositorys.collection_favorite_repository import (
    favorite_collection_ids_for_user,
)

if TYPE_CHECKING:
    from repositorys.collection_repository import CollectionSearchParams


@dataclass
class CollectionFilterResult:
    filters: list
    force_empty: bool = False


def build_collection_filters(user, params: "CollectionSearchParams") -> CollectionFilterResult:
    filters = []

    if params.visibility:
        filters.append(Collection.visibility == params.visibility)

    if params.title_contains:
        filters.append(Collection.name.ilike(f"%{params.title_contains}%"))

    if params.ids:
        filters.append(Collection.id.in_(params.ids))

    if params.tags:
        for tag in params.tags:
            filters.append(Collection.tags.contains([tag]))

    if params.only_with_notes:
        note_exists = select(1).where(Note.collection_id == Collection.id).exists()
        filters.append(note_exists)

    if params.is_favorite:
        favorite_ids = favorite_collection_ids_for_user(user.id)
        if not favorite_ids:
            return CollectionFilterResult(filters=[], force_empty=True)
        filters.append(Collection.id.in_(favorite_ids))

    return CollectionFilterResult(filters=filters)


def build_collection_order(params: "CollectionSearchParams"):
    sort_map = {
        "title": Collection.name,
        "created_at": Collection.created_at,
        "updated_at": Collection.updated_at,
    }
    order_column = sort_map[params.sort_by]
    return order_column.desc() if params.sort_dir == "desc" else order_column.asc()

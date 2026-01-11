from dataclasses import dataclass
from typing import List, Literal, Optional, Tuple

from daos.note_dao import NoteShare
from repositorys.share_repository_utils import (
    add_share,
    delete_share,
    find_many_shares,
    find_share,
    find_shares_by_resource,
    update_share,
)


@dataclass
class NoteShareSearchParams:
    note_id: Optional[str] = None
    user_id: Optional[str] = None

    sort_by: Literal["created_at"] = "created_at"
    sort_dir: Literal["asc", "desc"] = "desc"

    limit: int = 50
    offset: int = 0


def find_many(
    params: Optional[NoteShareSearchParams] = None,
) -> Tuple[List[NoteShare], int]:
    return find_many_shares(
        NoteShare, params, NoteShareSearchParams, "note_id"
    )


def find_by_note(note_id: str) -> List[NoteShare]:
    return find_shares_by_resource(NoteShare, "note_id", note_id)


def find_one(note_id: str, user_id: str) -> Optional[NoteShare]:
    return find_share(NoteShare, "note_id", note_id, user_id)


def add(share: NoteShare) -> NoteShare:
    return add_share(NoteShare, "note_id", share)


def update(share: NoteShare) -> NoteShare:
    return update_share(NoteShare, "note_id", share)


def delete(note_id: str, user_id: str) -> bool:
    return delete_share(NoteShare, note_id, user_id)

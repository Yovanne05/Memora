from dataclasses import dataclass
from typing import List, Literal, Optional, Tuple

from daos.collection_dao import CollectionShare
from repositorys.share_repository_utils import (
    add_share,
    delete_share,
    find_many_shares,
    find_share,
    find_shares_by_resource,
    update_share,
)


@dataclass
class CollectionShareSearchParams:
    collection_id: Optional[str] = None
    user_id: Optional[str] = None

    sort_by: Literal["created_at"] = "created_at"
    sort_dir: Literal["asc", "desc"] = "desc"

    limit: int = 50
    offset: int = 0


def find_many(
    params: Optional[CollectionShareSearchParams] = None,
) -> Tuple[List[CollectionShare], int]:
    return find_many_shares(
        CollectionShare,
        params,
        CollectionShareSearchParams,
        "collection_id",
    )


def find_by_collection(collection_id: str) -> List[CollectionShare]:
    return find_shares_by_resource(
        CollectionShare, "collection_id", collection_id
    )


def find_one(
    collection_id: str, user_id: str
) -> Optional[CollectionShare]:
    return find_share(CollectionShare, "collection_id", collection_id, user_id)


def add(share: CollectionShare) -> CollectionShare:
    return add_share(CollectionShare, "collection_id", share)


def update(share: CollectionShare) -> CollectionShare:
    return update_share(CollectionShare, "collection_id", share)


def delete(collection_id: str, user_id: str) -> bool:
    return delete_share(CollectionShare, collection_id, user_id)

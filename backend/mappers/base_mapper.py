from typing import Collection, Optional, List

from sqlalchemy import inspect

from dtos.user_access_dto import UserAccessDTO
from utils.enums import SharePermissionEnum


class BaseResourceMapper:
    @staticmethod
    def build_user_access(entity) -> List[UserAccessDTO]:
        access_list: list[UserAccessDTO] = []

        insp = inspect(entity)
        if "owner" not in insp.unloaded and entity.owner:
            access_list.append(
                UserAccessDTO(
                    user_id=entity.owner_id,
                    permission=SharePermissionEnum.WRITE,
                )
            )

        if "shares" not in insp.unloaded:
            for share in entity.shares:
                access_list.append(
                    UserAccessDTO(
                        user_id=share.user_id,
                        permission=share.permission,
                    )
                )

        return access_list

    @staticmethod
    def resolve_is_favorite(
        entity_id: str, favorite_ids: Optional[Collection[str]]
    ) -> bool:
        if favorite_ids is None:
            return False
        return entity_id in favorite_ids

    @classmethod
    def add_user_context(
        cls,
        data: dict,
        entity,
        favorite_ids: Optional[Collection[str]] = None,
        current_user=None,
    ) -> dict:
        data["user_access"] = cls.build_user_access(entity)
        data["is_favorite"] = cls.resolve_is_favorite(
            entity.id, favorite_ids
        )
        return data

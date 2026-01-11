from flask import g

from utils.enums import RoleEnum


def is_admin_role(role: RoleEnum) -> bool:
    return role in {RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN}


def cached(cache_key: str, loader):
    if hasattr(g, cache_key):
        return getattr(g, cache_key)
    value = loader()
    setattr(g, cache_key, value)
    return value

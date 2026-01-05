import os
from dataclasses import dataclass
from typing import Optional
import boto3
from botocore.client import Config
from werkzeug.datastructures import FileStorage

import config


class StorageError(Exception):
    """Raised when a storage operation fails."""


@dataclass
class StorageSaveResult:
    key: str
    public_url: str


class StorageClient:
    driver: str

    def save_file(self, file: FileStorage, key: str, content_type: str) -> StorageSaveResult:
        raise NotImplementedError

    def delete_file(self, key: str) -> None:
        raise NotImplementedError

    def get_public_url(self, key: str) -> str:
        raise NotImplementedError

    def resolve_local_path(self, key: str) -> Optional[str]:
        raise NotImplementedError


class LocalStorageClient(StorageClient):
    driver = "local"

    def __init__(self, root_dir: str, public_base_url: str | None = None):
        self.root_dir = os.path.abspath(root_dir)
        self.public_base_url = public_base_url.rstrip("/") if public_base_url else None
        os.makedirs(self.root_dir, exist_ok=True)

    def _full_path(self, key: str) -> str:
        normalized = os.path.normpath(os.path.join(self.root_dir, key))
        if not normalized.startswith(self.root_dir):
            raise StorageError("Invalid storage key.")
        return normalized

    def save_file(self, file: FileStorage, key: str, content_type: str) -> StorageSaveResult:
        full_path = self._full_path(key)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        file.seek(0)
        file.save(full_path)
        return StorageSaveResult(key=key, public_url=self.get_public_url(key))

    def delete_file(self, key: str) -> None:
        path = self._full_path(key)
        if os.path.exists(path):
            os.remove(path)
        # Cleanup empty parent directories
        parent = os.path.dirname(path)
        while parent.startswith(self.root_dir):
            if os.path.exists(parent) and not os.listdir(parent):
                os.rmdir(parent)
                parent = os.path.dirname(parent)
            else:
                break

    def resolve_local_path(self, key: str) -> Optional[str]:
        return self._full_path(key)

    def get_public_url(self, key: str) -> str:
        if self.public_base_url:
            return f"{self.public_base_url}/{key}"
        # Fallback: let the controller build a route-based URL using the key pattern.
        return f"/{key}"


class S3StorageClient(StorageClient):
    driver = "s3"

    def __init__(
        self,
        bucket: str,
        endpoint_url: str,
        region_name: str,
        access_key: str,
        secret_key: str,
        public_base_url: str | None = None,
    ):
        if not boto3 or not Config:
            raise StorageError("boto3 is required for S3 storage but is not installed.")
        self.bucket = bucket
        self.endpoint_url = endpoint_url.rstrip("/")
        self.public_base_url = public_base_url.rstrip("/") if public_base_url else None
        self.client = boto3.client(
            "s3",
            endpoint_url=self.endpoint_url,
            region_name=region_name,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            config=Config(s3={"addressing_style": "path"}),
        )

    def save_file(self, file: FileStorage, key: str, content_type: str) -> StorageSaveResult:
        file.seek(0)
        extra_args = {"ContentType": content_type}
        self.client.upload_fileobj(file, self.bucket, key, ExtraArgs=extra_args)
        return StorageSaveResult(key=key, public_url=self.get_public_url(key))

    def delete_file(self, key: str) -> None:
        self.client.delete_object(Bucket=self.bucket, Key=key)

    def _object_url(self, key: str) -> str:
        if self.public_base_url:
            return f"{self.public_base_url}/{key}"
        return f"{self.endpoint_url}/{self.bucket}/{key}"

    def get_public_url(self, key: str) -> str:
        # Buckets are assumed public; return object URL.
        return self._object_url(key)


def get_storage_client() -> StorageClient:
    if config.STORAGE_DRIVER == "s3":
        required = {
            "STORAGE_S3_BUCKET": config.STORAGE_S3_BUCKET,
            "STORAGE_S3_ENDPOINT_URL": config.STORAGE_S3_ENDPOINT_URL,
            "STORAGE_S3_ACCESS_KEY": config.STORAGE_S3_ACCESS_KEY,
            "STORAGE_S3_SECRET_KEY": config.STORAGE_S3_SECRET_KEY,
        }
        missing = [k for k, v in required.items() if not v]
        if missing:
            raise StorageError(f"Missing S3 storage configuration: {', '.join(missing)}")

        return S3StorageClient(
            bucket=config.STORAGE_S3_BUCKET,
            endpoint_url=config.STORAGE_S3_ENDPOINT_URL,
            region_name=config.STORAGE_S3_REGION,
            access_key=config.STORAGE_S3_ACCESS_KEY,
            secret_key=config.STORAGE_S3_SECRET_KEY,
            public_base_url=config.STORAGE_S3_PUBLIC_BASE_URL,
        )

    return LocalStorageClient(
        root_dir=config.UPLOAD_LOCAL_ROOT,
        public_base_url=config.UPLOAD_PUBLIC_BASE_URL,
    )

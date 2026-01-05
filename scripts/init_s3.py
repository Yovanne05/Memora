"""Initialize the S3 bucket for uploads (SeaweedFS or any S3-compatible endpoint).

Creates the bucket if missing and applies a public read-only policy on objects
so generated URLs are accessible without auth.
"""
import json
import sys
from pathlib import Path

import boto3
from botocore.exceptions import ClientError

# Ensure project root is on sys.path when running this script directly
ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import config  # noqa: E402  (import after sys.path adjustment)


def ensure_required_config() -> None:
    required = {
        "STORAGE_S3_BUCKET": config.STORAGE_S3_BUCKET,
        "STORAGE_S3_ENDPOINT_URL": config.STORAGE_S3_ENDPOINT_URL,
        "STORAGE_S3_ACCESS_KEY": config.STORAGE_S3_ACCESS_KEY,
        "STORAGE_S3_SECRET_KEY": config.STORAGE_S3_SECRET_KEY,
    }
    missing = [k for k, v in required.items() if not v]
    if missing:
        raise SystemExit(f"Missing S3 config: {', '.join(missing)}")


def get_client():
    return boto3.client(
        "s3",
        endpoint_url=config.STORAGE_S3_ENDPOINT_URL.rstrip("/"),
        region_name=config.STORAGE_S3_REGION,
        aws_access_key_id=config.STORAGE_S3_ACCESS_KEY,
        aws_secret_access_key=config.STORAGE_S3_SECRET_KEY,
    )


def bucket_exists(client, bucket: str) -> bool:
    try:
        client.head_bucket(Bucket=bucket)
        return True
    except ClientError as exc:
        status = exc.response.get("ResponseMetadata", {}).get("HTTPStatusCode")
        if status in (301, 403, 404):
            return False
        raise


def ensure_bucket(client, bucket: str) -> None:
    if bucket_exists(client, bucket):
        print(f"Bucket already exists: {bucket}")
        return
    print(f"Creating bucket: {bucket}")
    client.create_bucket(Bucket=bucket)


def ensure_public_read_policy(client, bucket: str) -> None:
    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadForObjects",
                "Effect": "Allow",
                "Principal": "*",
                "Action": ["s3:GetObject"],
                "Resource": [f"arn:aws:s3:::{bucket}/*"],
            }
        ],
    }
    print(f"Applying public read policy to bucket: {bucket}")
    client.put_bucket_policy(Bucket=bucket, Policy=json.dumps(policy))


def main() -> None:
    ensure_required_config()
    bucket = config.STORAGE_S3_BUCKET
    client = get_client()
    ensure_bucket(client, bucket)
    ensure_public_read_policy(client, bucket)
    print("Done.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001
        sys.exit(f"init_s3 failed: {exc}")

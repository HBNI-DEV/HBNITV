import asyncio
import random
import time

import psycopg2
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from tornado.ioloop import PeriodicCallback

from app.config.environments import Environment
from app.utils.google_api import get_delegated_drive_service, get_users


def _get_connection():
    return psycopg2.connect(
        dbname=Environment.POSTGRES_DB,
        user=Environment.POSTGRES_USER,
        password=Environment.POSTGRES_PASSWORD,
        host=Environment.POSTGRES_HOST,
        port=Environment.POSTGRES_PORT,
    )


def safe_execute(request, max_retries=5):
    for attempt in range(max_retries):
        try:
            return request.execute()
        except HttpError as e:
            if e.resp.status in [500, 503]:
                wait = (2**attempt) + random.uniform(0, 1)
                print(f"[RETRY] API error {e.resp.status}. Retrying in {wait:.2f}s...")
                time.sleep(wait)
            else:
                raise
    raise Exception(f"Request failed after {max_retries} retries.")


def _insert_shared_folder(folder_id: str, delegated_email: str):
    conn = _get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS shared_google_folders (
                folder_id TEXT PRIMARY KEY,
                delegated_email TEXT NOT NULL
            )
        """)
        cur.execute(
            """
            INSERT INTO shared_google_folders (folder_id, delegated_email)
            VALUES (%s, %s)
            ON CONFLICT (folder_id) DO UPDATE
            SET delegated_email = EXCLUDED.delegated_email
        """,
            (folder_id, delegated_email),
        )
        conn.commit()
    finally:
        cur.close()
        conn.close()


def cache_folders_and_users():
    for user in get_users("hbni.net"):
        DELEGATED_USER = user["primaryEmail"]
        service = get_delegated_drive_service(DELEGATED_USER)

        query = (
            "mimeType = 'application/vnd.google-apps.folder' "
            "and name = 'Meet Recordings' "
            "and trashed = false"
        )

        results = safe_execute(
            service.files().list(
                q=query,
                fields="files(id, name, parents)",
                pageSize=1000,
            )
        )

        folders = results.get("files", [])

        for folder in folders:
            folder_id = folder["id"]

            try:
                _insert_shared_folder(folder["id"], DELEGATED_USER)
                print(
                    f"[CACHE] Folder cached: {folder_id} delegated to {DELEGATED_USER}"
                )
                permission = {
                    "type": "anyone",
                    "role": "reader",
                    "allowFileDiscovery": False,
                }

                service.permissions().create(
                    fileId=folder_id,
                    body=permission,
                    supportsAllDrives=True,
                    fields="id",
                ).execute()
                print(f"[PERMISSION] Shared {folder_id} with hbni.net (link-only)")
            except Exception as api_err:
                print(f"[ERROR] Failed to cache folder {folder_id}: {api_err}")


def start_folder_cache_updater():
    async def run_in_thread():
        await asyncio.to_thread(cache_folders_and_users)

    PeriodicCallback(
        lambda: asyncio.ensure_future(run_in_thread()),
        60000 * Environment.UPDATE_GOOGLE_SHARED_FOLDERS_INTERVAL_MINUTES,
    ).start()

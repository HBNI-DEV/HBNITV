import asyncio
import random
import time

import psycopg2
from googleapiclient.errors import HttpError
from tornado.ioloop import PeriodicCallback

from app.config.environments import Environment
from app.utils.google_api import get_delegated_drive_service, get_users


def get_cache_from_db():
    conn = _get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM shared_google_folders")
        rows = cur.fetchall()
        cache = {
            row[0]: {
                "name": row[1],
                "parents": row[2],
                "delegated_email": row[3],
                "allowed_accounts": row[4],
            }
            for row in rows
        }
    finally:
        cur.close()
        conn.close()
    return cache


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


def _insert_shared_folder(folder: dict[str, str], delegated_email: str):
    conn = _get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS shared_google_folders (
                folder_id TEXT PRIMARY KEY,
                name TEXT,
                parents TEXT[],
                delegated_email TEXT NOT NULL,
                allowed_accounts TEXT[] NOT NULL
            )
        """)
        cur.execute(
            """
            INSERT INTO shared_google_folders (folder_id, name, parents, delegated_email, allowed_accounts)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (folder_id) DO UPDATE
            SET delegated_email = EXCLUDED.delegated_email
        """,
            (folder["id"], folder["name"], folder["parents"], delegated_email, "{}"),
        )
        conn.commit()
    finally:
        cur.close()
        conn.close()


def cache_folders_and_users():
    query = "mimeType = 'application/vnd.google-apps.folder' and name = 'Meet Recordings' and trashed = false"
    permission = {
        "type": "domain",
        "role": "reader",
        "domain": "hbnitv.net",
        "allowFileDiscovery": False,
    }

    for user in get_users("hbni.net"):
        DELEGATED_USER = user["primaryEmail"]
        service = get_delegated_drive_service(DELEGATED_USER)

        results = safe_execute(
            service.files().list(
                q=query,
                fields="files(id, name, parents)",
                pageSize=1000,
            )
        )

        folders = results.get("files", [])

        for folder in folders:
            print(folder)
            folder_id = folder["id"]

            try:
                _insert_shared_folder(folder, DELEGATED_USER)
                print(f"[CACHE] Folder cached: {folder_id} delegated to {DELEGATED_USER}")

                service.permissions().create(
                    fileId=folder_id,
                    body=permission,
                    supportsAllDrives=True,
                    fields="id",
                ).execute()
                print(f"[PERMISSION] Shared {folder_id} with hbni.net (domain)")

                # Recursively find all subfolders
                subfolders = get_subfolders(service, folder_id)
                for subfolder in subfolders:
                    print(subfolder)
                    _insert_shared_folder(subfolder, DELEGATED_USER)
                    print(f"[CACHE] Subfolder cached: {subfolder['id']} delegated to {DELEGATED_USER}")
                    service.permissions().create(
                        fileId=subfolder["id"],
                        body=permission,
                        supportsAllDrives=True,
                        fields="id",
                    ).execute()
                    print(f"[PERMISSION] Shared {subfolder['id']} with hbni.net (domain)")
            except Exception as api_err:
                print(f"[ERROR] Failed to cache folder {folder_id}: {api_err}")


def get_subfolders(service, folder_id):
    subfolders = []
    query = f"'{folder_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    results = safe_execute(
        service.files().list(
            q=query,
            fields="files(id, name, parents)",
            pageSize=1000,
        )
    )
    subfolders.extend(results.get("files", []))

    # Recursively find subfolders of subfolders
    for subfolder in subfolders:
        subsubfolders = get_subfolders(service, subfolder["id"])
        subfolders.extend(subsubfolders)

    return subfolders


def start_folder_cache_updater():
    async def run_in_thread():
        await asyncio.to_thread(cache_folders_and_users)

    PeriodicCallback(
        lambda: asyncio.ensure_future(run_in_thread()),
        60000 * Environment.UPDATE_GOOGLE_SHARED_FOLDERS_INTERVAL_MINUTES,
    ).start()

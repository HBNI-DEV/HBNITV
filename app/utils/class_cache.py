import asyncio
from datetime import datetime, timezone

import psycopg2
from tornado.ioloop import PeriodicCallback

from app.config.environments import Environment
from app.utils import google_api

# Global cache
classes_cache = {}


def format_created_time(iso_time_str: str) -> tuple[str, str]:
    """Returns (readable_date, relative_time) from ISO timestamp"""
    created_dt = datetime.fromisoformat(iso_time_str.replace("Z", "+00:00"))
    now = datetime.now(timezone.utc)
    delta_days = (now - created_dt).days

    readable_date = created_dt.strftime("%B %d, %Y %I:%M %p")
    relative = (
        "Today"
        if delta_days == 0
        else f"{delta_days} day{'s' if delta_days != 1 else ''} ago"
    )

    return readable_date, relative


def get_shared_folders_from_db() -> list[tuple[str, str]]:
    conn = psycopg2.connect(
        dbname=Environment.POSTGRES_DB,
        user=Environment.POSTGRES_USER,
        password=Environment.POSTGRES_PASSWORD,
        host=Environment.POSTGRES_HOST,
        port=Environment.POSTGRES_PORT,
    )
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT folder_id, delegated_email
            FROM shared_google_folders
        """)
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()


def update_class_cache():
    try:
        classes_cache.clear()
        folders = get_shared_folders_from_db()

        for folder_id, delegated_email in folders:
            drive_service = google_api.get_drive_credentials(delegated_email)
            mp4_files = google_api.list_mp4_files_in_folder(drive_service, folder_id)

            for file in mp4_files:
                metadata = google_api.get_file_metadata(drive_service, file["id"])
                metadata["delegatedEmail"] = delegated_email
                created_time = metadata.get("createdTime")

                if created_time:
                    readable, relative = format_created_time(created_time)
                    metadata["createdTimeReadable"] = readable
                    metadata["createdTimeRelative"] = relative

                classes_cache[file["id"]] = metadata
    except Exception as e:
        print(f"[ClassCache] ❌ Error updating cache: {e}")


def start_cache_updater():
    async def run_in_thread():
        await asyncio.to_thread(update_class_cache)

    PeriodicCallback(
        lambda: asyncio.ensure_future(run_in_thread()),
        60000 * Environment.UPDATE_CLASS_CACHE_INTERVAL_MINUTES,
    ).start()

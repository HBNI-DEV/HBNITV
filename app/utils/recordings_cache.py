import asyncio
from collections import defaultdict
from datetime import datetime, timezone
from typing import List, Literal, TypedDict

import psycopg2
from tornado.ioloop import PeriodicCallback

from app.config.environments import Environment
from app.utils import google_api


class Owner(TypedDict):
    kind: Literal["drive#user"]
    displayName: str
    photoLink: str
    me: bool
    permissionId: str
    emailAddress: str


class VideoMediaMetadata(TypedDict):
    width: int
    height: int
    # Google Drive API returns this as a string in many cases
    durationMillis: str


class RecordingItem(TypedDict):
    id: str
    name: str
    delegatedEmail: str
    folderName: str
    folderId: str
    allowedAccounts: list[str]
    mimeType: str
    webContentLink: str
    webViewLink: str
    thumbnailLink: str
    createdTime: str  # ISO 8601 string from Drive, e.g. "2025-08-13T21:01:03.733Z"
    modifiedTime: str  # ISO 8601 string from Drive
    owners: List[Owner]
    size: str  # Size in bytes as a string from Drive
    videoMediaMetadata: VideoMediaMetadata
    delegatedEmail: str
    folderName: str
    durationReadable: str  # e.g., "16:19"
    createdTimeReadable: str  # e.g., "August 13, 2025 09:01 PM"
    createdTimeRelative: str  # e.g., "Today"
    _created_dt: datetime  # Python datetime you computed


# Global cache
recordings_cache: list[RecordingItem] = []


def _get_connection():
    return psycopg2.connect(
        dbname=Environment.POSTGRES_DB,
        user=Environment.POSTGRES_USER,
        password=Environment.POSTGRES_PASSWORD,
        host=Environment.POSTGRES_HOST,
        port=Environment.POSTGRES_PORT,
    )


def format_created_time(iso_time_str: str) -> tuple[str, str]:
    """Returns (readable_date, relative_time) from ISO timestamp"""
    created_dt = datetime.fromisoformat(iso_time_str.replace("Z", "+00:00"))
    now = datetime.now(timezone.utc)
    delta_days = (now - created_dt).days

    readable_date = created_dt.strftime("%B %d, %Y %I:%M %p")
    relative = "Today" if delta_days == 0 else f"{delta_days} day{'s' if delta_days != 1 else ''} ago"

    return readable_date, relative


def get_shared_folders_from_db() -> list[tuple[str, str, str, list[str]]]:
    conn = _get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT folder_id, name, delegated_email, allowed_accounts
            FROM shared_google_folders
        """)
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()


def format_duration(duration_ms: str) -> str:
    try:
        total_seconds = int(duration_ms) // 1000
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)

        if hours > 0:
            return f"{hours}:{minutes:02}:{seconds:02}"
        elif minutes > 0:
            return f"{minutes}:{seconds:02}"
        else:
            return f"{seconds}s"
    except Exception:
        return ""


def update_recordings_cache():
    try:
        new_cache = {}
        folders = get_shared_folders_from_db()
        all_recordings: list[RecordingItem] = []

        for folder_id, folder_name, delegated_email, allowed_accounts in folders:
            drive_service = google_api.get_drive_credentials(delegated_email)
            mp4_files = google_api.list_mp4_files_in_folder(drive_service, folder_id)
            for file in mp4_files:
                metadata = google_api.get_file_metadata(drive_service, file["id"])
                metadata["delegatedEmail"] = delegated_email
                metadata["folderName"] = folder_name
                metadata["folderId"] = folder_id
                metadata["allowedAccounts"] = allowed_accounts
                created_time = metadata.get("createdTime")
                if duration_ms := metadata.get("videoMediaMetadata", {}).get("durationMillis"):
                    metadata["durationReadable"] = format_duration(duration_ms)

                if created_time:
                    readable, relative = format_created_time(created_time)
                    metadata["createdTimeReadable"] = readable
                    metadata["createdTimeRelative"] = relative
                    metadata["_created_dt"] = datetime.fromisoformat(created_time.replace("Z", "+00:00"))

                all_recordings.append(metadata)

        # Sort by datetime (latest first)
        all_recordings.sort(key=lambda x: x.get("_created_dt", datetime.min), reverse=True)

        new_cache = all_recordings

        recordings_cache.clear()
        for recording_item in new_cache:
            recordings_cache.append(recording_item)
    except Exception as e:
        print(f"[ClassCache] ❌ Error updating cache: {e}")


def start_recordings_cache_updater():
    async def run_in_thread():
        await asyncio.to_thread(update_recordings_cache)

    PeriodicCallback(
        lambda: asyncio.ensure_future(run_in_thread()),
        60000 * Environment.UPDATE_CLASS_CACHE_INTERVAL_MINUTES,
    ).start()

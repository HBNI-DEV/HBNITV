import asyncio
from collections import defaultdict
from datetime import datetime, timezone

import psycopg2
from tornado.ioloop import PeriodicCallback

from app.config.environments import Environment
from app.utils import google_api

# Global cache
recordings_cache = {}


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
    relative = (
        "Today"
        if delta_days == 0
        else f"{delta_days} day{'s' if delta_days != 1 else ''} ago"
    )

    return readable_date, relative


def get_shared_folders_from_db() -> list[tuple[str, str]]:
    conn = _get_connection()
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
        # Temporary cache built separately
        new_cache = {}

        folders = get_shared_folders_from_db()

        all_recordings = []
        unique_owners = {}

        for folder_id, delegated_email in folders:
            drive_service = google_api.get_drive_credentials(delegated_email)
            mp4_files = google_api.list_mp4_files_in_folder(drive_service, folder_id)

            for file in mp4_files:
                metadata = google_api.get_file_metadata(drive_service, file["id"])
                metadata["delegatedEmail"] = delegated_email
                owner_info = metadata.get("owners", [{}])[0]
                owner_email = owner_info.get("emailAddress", "unknown")
                owner_name = owner_info.get("displayName", "Unknown")
                owner_photo = owner_info.get("photoLink", "")

                # Track owner metadata
                unique_owners[owner_email] = {
                    "email": owner_email,
                    "displayName": owner_name,
                    "photoLink": owner_photo,
                }
                created_time = metadata.get("createdTime")
                duration_ms = metadata.get("videoMediaMetadata", {}).get(
                    "durationMillis"
                )
                if duration_ms:
                    metadata["durationReadable"] = format_duration(duration_ms)

                if created_time:
                    readable, relative = format_created_time(created_time)
                    metadata["createdTimeReadable"] = readable
                    metadata["createdTimeRelative"] = relative
                    metadata["_created_dt"] = datetime.fromisoformat(
                        created_time.replace("Z", "+00:00")
                    )

                all_recordings.append(metadata)

        # Sort by datetime (latest first)
        all_recordings.sort(
            key=lambda x: x.get("_created_dt", datetime.min), reverse=True
        )

        # Group by category
        grouped = defaultdict(list)
        now = datetime.now(tz=timezone.utc)

        for item in all_recordings:
            dt = item.get("_created_dt")
            if not dt:
                grouped["Everything Else"].append(item)
                continue

            delta = now - dt

            if delta.days < 7:
                grouped["This Week"].append(item)
            elif 7 <= delta.days < 14:
                grouped["Last Week"].append(item)
            elif 14 <= delta.days < 31:
                grouped["Last Month"].append(item)
            else:
                grouped["Everything Else"].append(item)

        # Finalize and clean
        new_cache["tabs"] = grouped
        new_cache["_owners"] = list(unique_owners.values())

        recordings_cache.clear()
        recordings_cache.update(new_cache)
    except Exception as e:
        print(f"[ClassCache] ❌ Error updating cache: {e}")


def start_recordings_cache_updater():
    async def run_in_thread():
        await asyncio.to_thread(update_recordings_cache)

    PeriodicCallback(
        lambda: asyncio.ensure_future(run_in_thread()),
        60000 * Environment.UPDATE_CLASS_CACHE_INTERVAL_MINUTES,
    ).start()

import asyncio
from datetime import datetime, timezone

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


async def update_class_cache():
    try:
        drive_service = google_api.get_drive_service()
        mp4_files = google_api.list_mp4_files_in_folder(
            drive_service, Environment.CLASSES_FOLDER_ID
        )

        classes_cache.clear()

        for file in mp4_files:
            metadata = google_api.get_file_metadata(drive_service, file["id"])
            created_time = metadata.get("createdTime")

            if created_time:
                readable, relative = format_created_time(created_time)
                metadata["createdTimeReadable"] = readable
                metadata["createdTimeRelative"] = relative

            classes_cache[file["id"]] = metadata
    except Exception as e:
        print(f"[ClassCache] ❌ Error updating cache: {e}")


def start_cache_updater():
    PeriodicCallback(lambda: asyncio.ensure_future(update_class_cache()), 60000).start()

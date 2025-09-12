import asyncio
import io
import re
from datetime import datetime
from typing import TypedDict

import psycopg2
from googleapiclient.http import MediaIoBaseDownload, MediaIoBaseUpload
from tornado.ioloop import PeriodicCallback

from app.config.environments import Environment
from app.utils import google_api

# Global flag to track running state
_is_running = False


def _get_connection():
    return psycopg2.connect(
        dbname=Environment.POSTGRES_DB,
        user=Environment.POSTGRES_USER,
        password=Environment.POSTGRES_PASSWORD,
        host=Environment.POSTGRES_HOST,
        port=Environment.POSTGRES_PORT,
    )


class FileName(TypedDict):
    owner: str
    class_name: str
    date: str


def parse_file_name(file_name: str) -> FileName | None:
    # Pattern 1: full "owner - class - date - Recording"
    p1 = r"^(.+?) - (.+?) - (.+?) - Recording$"
    # Pattern 2: "class - date - Recording" (no owner)
    p2 = r"^([^-]+) - (.+?) - Recording$"
    # Pattern 3: just a date-like string (no owner, no class)
    p3 = r"^(.*\(\d{4}-\d{2}-\d{2} .+\))$"

    if m := re.match(p1, file_name):
        return {"class_name": m.group(1), "owner": m.group(2), "date": m.group(3)}
    elif m := re.match(p2, file_name):
        return {"class_name": m.group(1), "owner": "No Name", "date": m.group(2)}
    elif m := re.match(p3, file_name):
        return {"owner": "No Name", "class_name": "No Class", "date": m.group(1)}
    else:
        return None


def get_current_and_next_school_year() -> str:
    now = datetime.now()
    year = now.year
    month = now.month

    # If current month is September (9) or later, school year starts this year
    if month >= 9:
        start_year = year
        end_year = year + 1
    else:
        # If current month is before September, school year started last year
        start_year = year - 1
        end_year = year

    return f"{start_year}-{end_year}"


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


def ensure_folder(drive, parent_id: str, folder_name: str) -> str:
    """Check if a folder exists inside a parent folder. Create it if missing. Returns folder ID."""
    existing_id = google_api.folder_exists_in_folder(drive, parent_id, folder_name)
    if existing_id:
        return existing_id

    created_folder = google_api.create_folder_in_folder(drive, parent_id, folder_name)
    return created_folder["id"]


def file_exists_in_folder(drive, parent_folder_id: str, file_name: str) -> bool:
    """Return True if a file with the same name exists in the given folder."""
    query = f"'{parent_folder_id}' in parents and name='{file_name}' and trashed=false"
    response = drive.files().list(q=query, fields="files(id)").execute()
    return len(response.get("files", [])) > 0


def transfer_file_between_accounts(user_drive_service, src_file_id, service_worker_drive_credentials, dst_folder_id):
    # Step 1 — Download as source account
    file_metadata = user_drive_service.files().get(fileId=src_file_id, fields="name").execute()
    file_name = file_metadata["name"]

    request = user_drive_service.files().get_media(fileId=src_file_id)
    file_stream = io.BytesIO()
    downloader = MediaIoBaseDownload(file_stream, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
        print(f"Downloading {file_name}: {int(status.progress() * 100)}%")
    file_stream.seek(0)  # rewind to start

    # Step 2 — Upload as destination account
    media = MediaIoBaseUpload(file_stream, mimetype="video/mp4", resumable=True)
    service_worker_drive_credentials.files().create(body={"name": file_name, "parents": [dst_folder_id]}, media_body=media).execute()
    print(f"Uploaded {file_name} to {dst_folder_id}")


def organize_media():
    global _is_running
    if _is_running:
        print("[Organizer] Skipping run - already in progress.")
        return

    _is_running = True

    try:
        if not Environment.HBNITV_RECORDINGS_FOLDER_ID:
            print("[Organizer] No recordings folder id set")
            return

        if not Environment.HBNITV_RECORDINGS_DELEGATED_ADMIN_EMAIL:
            print("[Organizer] No delegated admin email set")
            return

        if not Environment.HBNITV_MEET_RECORDINGS_FOLDER_ID:
            print("[Organizer] No meet recordings folder id set")
            return

        current_year_range = get_current_and_next_school_year()

        service_worker_drive_credentials = google_api.get_drive_credentials(Environment.HBNITV_RECORDINGS_DELEGATED_ADMIN_EMAIL)
        mp4_files = google_api.list_mp4_files_in_folder(
            service_worker_drive_credentials,
            Environment.HBNITV_MEET_RECORDINGS_FOLDER_ID,
        )

        for file in mp4_files:
            metadata = google_api.get_file_metadata(service_worker_drive_credentials, file["id"])

            file_name = parse_file_name(metadata["name"])
            if not file_name:
                print(f"Skipping file with unrecognized format: {metadata['name']}")
                continue

            # Step 1: Year range folder
            year_folder_id = ensure_folder(
                service_worker_drive_credentials,
                Environment.HBNITV_RECORDINGS_FOLDER_ID,
                current_year_range,
            )
            backup_year_folder_id = ensure_folder(
                service_worker_drive_credentials,
                Environment.HBNITV_BACKUP_RECORDINGS_FOLDER_ID,
                current_year_range,
            )

            # Step 2: Owner folder
            owner_folder_id = ensure_folder(service_worker_drive_credentials, year_folder_id, file_name["owner"])
            backup_ownder_folder_id = ensure_folder(service_worker_drive_credentials, backup_year_folder_id, file_name["owner"])

            # Step 3: Class folder
            class_folder_id = ensure_folder(
                service_worker_drive_credentials,
                owner_folder_id,
                file_name["class_name"],
            )
            backup_class_folder_id = ensure_folder(
                service_worker_drive_credentials,
                backup_ownder_folder_id,
                file_name["class_name"],
            )

            # Step 4: Copy file to class folder only if not already there
            if file_exists_in_folder(service_worker_drive_credentials, class_folder_id, metadata["name"]):
                print(f"Skipping {metadata['name']} (already exists in destination)")
            else:
                print(f"Moving {metadata['name']} to {current_year_range}/{file_name['owner']}/{file_name['class_name']}")
                google_api.copy_file_to_folder(
                    drive=service_worker_drive_credentials,
                    file_id=file["id"],
                    folder_id=class_folder_id,
                )
            # Step 5: Copy file to backup folder only if not already there
            if file_exists_in_folder(service_worker_drive_credentials, backup_class_folder_id, metadata["name"]):
                print(f"Skipping {metadata['name']} (already exists in backup destination)")
            else:
                print(f"Backing up {metadata['name']} to backup/{current_year_range}/{file_name['owner']}/{file_name['class_name']}")
                google_api.move_file_to_folder(
                    drive=service_worker_drive_credentials,
                    file_id=file["id"],
                    folder_id=backup_class_folder_id,
                )
    except Exception as e:
        print(f"[Organizer] Error updating cache: {e}")
    finally:
        _is_running = False


def start_organizer():
    async def run_in_thread():
        await asyncio.to_thread(organize_media)

    PeriodicCallback(
        lambda: asyncio.ensure_future(run_in_thread()),
        60000 * Environment.UPDATE_FILE_ORGANIZER_INTERVAL_MINUTES,
    ).start()

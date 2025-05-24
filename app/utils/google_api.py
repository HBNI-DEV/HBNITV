import asyncio
import io

import psycopg2
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaIoBaseDownload
from tornado.ioloop import PeriodicCallback

from app.config.environments import Environment


def get_workspace_directory_service():
    credentials = service_account.Credentials.from_service_account_file(
        Environment.SERVICE_ACCOUNT_FILE,
        scopes=[
            "https://www.googleapis.com/auth/admin.directory.user",
            "https://www.googleapis.com/auth/admin.directory.group.member",
        ],
    ).with_subject(Environment.DELEGATED_ADMIN)

    return build("admin", "directory_v1", credentials=credentials)


def get_drive_service():
    credentials = service_account.Credentials.from_service_account_file(
        Environment.SERVICE_ACCOUNT_FILE,
        scopes=[
            "https://www.googleapis.com/auth/drive",
        ],
    ).with_subject(Environment.DELEGATED_ADMIN)

    return build("drive", "v3", credentials=credentials)


def get_drive_credentials(delegated_email: str):
    credentials = service_account.Credentials.from_service_account_file(
        Environment.SERVICE_ACCOUNT_FILE,
        scopes=[
            "https://www.googleapis.com/auth/drive",
        ],
    ).with_subject(delegated_email)

    return build("drive", "v3", credentials=credentials)


def list_mp4_files_in_folder(drive, folder_id: str) -> list[dict]:
    query = f"'{folder_id}' in parents and mimeType='video/mp4' and trashed=false"
    try:
        response = (
            drive.files()
            .list(
                q=query,
                spaces="drive",
                fields="files(id, name, mimeType)",
            )
            .execute()
        )
        return response.get("files", [])
    except HttpError as error:
        print(f"An error occurred: {error}")
        return []


def get_file_metadata(drive, file_id: str) -> dict:
    try:
        return (
            drive.files()
            .get(
                fileId=file_id,
                fields="id, name, mimeType, thumbnailLink, size, createdTime, modifiedTime, owners, webViewLink, webContentLink, videoMediaMetadata",
            )
            .execute()
        )
    except HttpError as error:
        print(f"An error occurred: {error}")
        return {}


def download_file(drive, file_id: str, destination_path: str):
    try:
        request = drive.files().get_media(fileId=file_id)
        fh = io.FileIO(destination_path, "wb")
        downloader = MediaIoBaseDownload(fh, request)

        done = False
        while not done:
            status, done = downloader.next_chunk()
            print(f"Download progress: {int(status.progress() * 100)}%")
    except HttpError as error:
        print(f"An error occurred: {error}")


def create_user_if_not_exists(user_info: dict[str, str], org_unit="/Students"):
    directory = get_workspace_directory_service()

    email = user_info["email"]
    given_name = user_info["given_name"]
    family_name = user_info["family_name"]
    password = user_info["password"]

    try:
        directory.users().get(userKey=email).execute()
        return {"created": False, "message": f"User {email} already exists."}
    except HttpError as e:
        if e.resp.status == 404:
            user = {
                "name": {
                    "givenName": given_name,
                    "familyName": family_name,
                },
                "password": password,
                "primaryEmail": email,
                "orgUnitPath": org_unit,
            }
            created_user = directory.users().insert(body=user).execute()
            return {
                "created": True,
                "message": f"User {created_user['primaryEmail']} created.",
            }
        else:
            raise


def list_users():
    credentials = service_account.Credentials.from_service_account_file(
        Environment.SERVICE_ACCOUNT_FILE,
        scopes=["https://www.googleapis.com/auth/admin.directory.user.readonly"],
    ).with_subject(Environment.DELEGATED_ADMIN)
    service = build("admin", "directory_v1", credentials=credentials)

    users = []
    page_token = None

    while True:
        results = (
            service.users()
            .list(
                customer="my_customer",
                domain="hbni.net",
                maxResults=100,
                pageToken=page_token,
                orderBy="email",
            )
            .execute()
        )

        users.extend(results.get("users", []))
        page_token = results.get("nextPageToken")
        if not page_token:
            break

    return users


def _get_connection():
    return psycopg2.connect(
        dbname=Environment.POSTGRES_DB,
        user=Environment.POSTGRES_USER,
        password=Environment.POSTGRES_PASSWORD,
        host=Environment.POSTGRES_HOST,
        port=Environment.POSTGRES_PORT,
    )


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
    for user in list_users():
        DELEGATED_USER = user["primaryEmail"]
        credentials = service_account.Credentials.from_service_account_file(
            Environment.SERVICE_ACCOUNT_FILE,
            scopes=["https://www.googleapis.com/auth/drive"],
        ).with_subject(DELEGATED_USER)

        drive_service = build("drive", "v3", credentials=credentials)

        query = (
            "mimeType = 'application/vnd.google-apps.folder' "
            "and name = 'Meet Recordings' "
            "and trashed = false"
        )

        results = (
            drive_service.files()
            .list(
                q=query,
                fields="files(id, name, parents)",
                pageSize=1000,
            )
            .execute()
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

                drive_service.permissions().create(
                    fileId=folder_id,
                    body=permission,
                    supportsAllDrives=True,
                    fields="id",
                ).execute()
                print(f"[PERMISSION] Shared {folder_id} with hbni.net (link-only)")
            except Exception as api_err:
                print(f"[ERROR] Failed to cache folder {folder_id}: {api_err}")


def move_files():
    users = list_users()
    credentials = service_account.Credentials.from_service_account_file(
        Environment.SERVICE_ACCOUNT_FILE,
        scopes=["https://www.googleapis.com/auth/drive"],
    ).with_subject(Environment.DELEGATED_ADMIN)

    for user in users:
        creds = credentials.with_subject(user["primaryEmail"])
        user_drive = build("drive", "v3", credentials=creds)
        files = (
            user_drive.files()
            .list(
                q="'Meet Recordings' in parents and mimeType='video/mp4'",
                fields="files(id, name)",
            )
            .execute()
            .get("files", [])
        )

        for f in files:
            user_drive.files().update(
                fileId=f["id"],
                addParents=Environment.CLASSES_FOLDER_ID,
                removeParents="Meet Recordings",
                fields="id, parents",
            ).execute()


def start_folder_cache_updater():
    async def run_in_thread():
        await asyncio.to_thread(cache_folders_and_users)

    PeriodicCallback(
        lambda: asyncio.ensure_future(run_in_thread()),
        60000 * Environment.UPDATE_GOOGLE_SHARED_FOLDERS_INTERVAL_MINUTES,
    ).start()

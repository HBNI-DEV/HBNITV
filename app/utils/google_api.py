import io
from datetime import datetime, timezone

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaIoBaseDownload

from app.config.environments import Environment


def get_workspace_directory_service():
    credentials = service_account.Credentials.from_service_account_file(
        Environment.SERVICE_ACCOUNT_FILE,
        scopes=[
            "https://www.googleapis.com/auth/admin.directory.user",
            "https://www.googleapis.com/auth/admin.directory.group.member",
            "https://www.googleapis.com/auth/admin.directory.orgunit",
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


def get_delegated_drive_service(delegated_email: str):
    credentials = service_account.Credentials.from_service_account_file(
        Environment.SERVICE_ACCOUNT_FILE,
        scopes=[
            "https://www.googleapis.com/auth/drive",
        ],
    ).with_subject(delegated_email)

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


def get_users(domain: str):
    service = get_workspace_directory_service()

    users = []
    page_token = None

    while True:
        results = (
            service.users()
            .list(
                customer="my_customer",
                domain=domain,
                maxResults=100,
                pageToken=page_token,
                orderBy="email",
                projection="full",
            )
            .execute()
        )

        users.extend(results.get("users", []))
        page_token = results.get("nextPageToken")
        if not page_token:
            break

    return users


def get_all_users():
    service = get_workspace_directory_service()

    users = []
    page_token = None

    while True:
        results = (
            service.users()
            .list(
                customer="my_customer",  # gets all domains under this Workspace customer
                maxResults=100,
                pageToken=page_token,
                orderBy="email",
                projection="full",
            )
            .execute()
        )

        users.extend(results.get("users", []))
        page_token = results.get("nextPageToken")
        if not page_token:
            break

    return users


def suspend_user(service, user_email: str):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    service.users().update(
        userKey=user_email,
        body={
            "suspended": True,
            "customSchemas": {
                "SuspensionMetadata": {
                    "suspensionStartDate": now,
                    "reason": "Inactivity for more than 1 year. This is a automated suspension. ",
                }
            },
        },
    ).execute()
    print(f"Suspended: {user_email}")


def delete_user(service, user_email: str):
    service.users().delete(userKey=user_email).execute()


def get_all_org_units(
    customer_id: str = "my_customer", org_unit_path: str = "/", type_: str = "all"
) -> list[dict]:
    service = get_workspace_directory_service()
    try:
        response = (
            service.orgunits()
            .list(customerId=customer_id, orgUnitPath=org_unit_path, type=type_)
            .execute()
        )
        return response.get("organizationUnits", [])
    except HttpError as error:
        print(f"An error occurred while listing org units: {error}")
        return []


def get_user_photo(service, user_id: str) -> dict:
    try:
        return service.users().photos().get(userKey=user_id).execute()
    except HttpError as error:
        if error.resp.status == 404:
            # User has no photo set
            return {}
        else:
            raise

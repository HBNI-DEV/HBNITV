from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from app.config.environments import Environment

SCOPES = [
    "https://www.googleapis.com/auth/admin.directory.user",
    "https://www.googleapis.com/auth/admin.directory.group.member",
]


def get_directory_service():
    credentials = service_account.Credentials.from_service_account_file(
        Environment.SERVICE_ACCOUNT_FILE, scopes=SCOPES
    ).with_subject(Environment.DELEGATED_ADMIN)

    return build("admin", "directory_v1", credentials=credentials)


def create_user_if_not_exists(
    directory, user_info: dict[str, str], org_unit="/Students"
):
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

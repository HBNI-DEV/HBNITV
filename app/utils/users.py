import asyncio
from datetime import datetime, timedelta, timezone

from tornado.ioloop import PeriodicCallback

from app.config.environments import Environment
from app.utils.google_api import (
    delete_user,
    get_all_users,
    get_workspace_directory_service,
    suspend_user,
)

# Global flag to prevent overlapping runs
_is_running = False

EXEMPT_KEYWORDS = ["admin", "studio", "recording"]


def list_all_inactive_users(years_inactive: int):
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=365 * years_inactive)
    all_users = get_all_users()
    inactive_users = []

    for user in all_users:
        if user["orgUnitPath"] == "/ITV Studios":
            print("Skipping ITV Studios user")
            continue
        email = user["primaryEmail"]
        if any(keyword in email for keyword in EXEMPT_KEYWORDS):
            print(f"Skipping exempt user: {email}")
            continue
        suspended = user.get("suspended", False)
        last_login_str = user.get("lastLoginTime")
        custom_schemas = user.get("customSchemas", {})

        if last_login_str:
            try:
                last_login = datetime.strptime(last_login_str, "%Y-%m-%dT%H:%M:%S.%fZ").replace(tzinfo=timezone.utc)
            except ValueError:
                last_login = datetime.strptime(last_login_str, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)

            if last_login < cutoff_date:
                inactive_users.append(
                    {
                        "email": email,
                        "last_login": last_login,
                        "suspended": suspended,
                        "customSchemas": custom_schemas,
                    }
                )
        else:
            # Never logged in
            inactive_users.append(
                {
                    "email": email,
                    "last_login": None,
                    "suspended": suspended,
                    "customSchemas": custom_schemas,
                }
            )

    return inactive_users


def suspend_inactive_users():
    service = get_workspace_directory_service()
    users_to_suspend = list_all_inactive_users(Environment.INACTIVITY_YEARS_BEFORE_SUSPEND)

    for user in users_to_suspend:
        if user["suspended"]:
            continue

        email = user["email"]
        try:
            suspend_user(service, email)
        except Exception as e:
            print(f"Error suspending {email}: {e}")


def delete_expired_suspended_users():
    service = get_workspace_directory_service()
    users = get_all_users()
    suspension_threshold = datetime.now(timezone.utc) - timedelta(days=Environment.SUSPENSION_DAYS_BEFORE_DELETE)

    for user in users:
        if user["orgUnitPath"] == "/ITV Studios":
            print("Skipping ITV Studios user")
            continue

        if user["orgUnitPath"] == "/ITV Recordings":
            print("Skipping ITV Recordings user")
            continue

        email = user["primaryEmail"]
        if any(keyword in email for keyword in EXEMPT_KEYWORDS):
            print(f"Skipping exempt user: {email}")
            continue

        if not user.get("suspended"):
            continue

        custom_schemas = user.get("customSchemas", {})
        metadata = custom_schemas.get("SuspensionMetadata", {})
        start_date_str = metadata.get("suspensionStartDate")

        if not start_date_str:
            continue

        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)

            if start_date < suspension_threshold:
                email = user["primaryEmail"]
                delete_user(service, email)
                print(f"Deleted user: {email}")
        except Exception as e:
            print(f"Error processing user {user.get('primaryEmail')}: {e}")


def run():
    global _is_running
    if _is_running:
        print("[UserCleanup] Skipping run - already in progress.")
        return

    _is_running = True
    try:
        suspend_inactive_users()
        delete_expired_suspended_users()
    finally:
        _is_running = False


def start_user_cleanup():
    async def run_in_thread():
        await asyncio.to_thread(run)

    PeriodicCallback(
        lambda: asyncio.ensure_future(run_in_thread()),
        60000 * Environment.UPDATE_USER_SUSPENSION_AND_DELETION_INTERVAL_MINUTES,
    ).start()

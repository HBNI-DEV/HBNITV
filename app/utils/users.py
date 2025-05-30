from datetime import datetime, timedelta, timezone

from app.utils.google_api import (
    delete_user,
    get_all_users,
    get_workspace_directory_service,
    suspend_user,
)


def list_all_inactive_users(years_inactive=1):
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=365 * years_inactive)
    all_users = get_all_users()
    inactive_users = []

    for user in all_users:
        email = user["primaryEmail"]
        suspended = user.get("suspended", False)
        last_login_str = user.get("lastLoginTime")
        custom_schemas = user.get("customSchemas", {})

        if last_login_str:
            try:
                last_login = datetime.strptime(
                    last_login_str, "%Y-%m-%dT%H:%M:%S.%fZ"
                ).replace(tzinfo=timezone.utc)
            except ValueError:
                last_login = datetime.strptime(
                    last_login_str, "%Y-%m-%dT%H:%M:%SZ"
                ).replace(tzinfo=timezone.utc)

            if last_login < cutoff_date:
                inactive_users.append(
                    {
                        "email": email,
                        "last_login": last_login,
                        "suspended": suspended,
                        "custom_schemas": custom_schemas,
                    }
                )
        else:
            # Never logged in
            inactive_users.append(
                {
                    "email": email,
                    "last_login": None,
                    "suspended": suspended,
                    "custom_schemas": custom_schemas,
                }
            )

    return inactive_users


def suspend_inactive_users():
    service = get_workspace_directory_service()
    users_to_suspend = list_all_inactive_users(years_inactive=1)

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
    one_month_ago = datetime.now(timezone.utc) - timedelta(days=30)

    for user in users:
        if not user.get("suspended"):
            continue

        custom_schemas = user.get("customSchemas", {})
        metadata = custom_schemas.get("SuspensionMetadata", {})
        start_date_str = metadata.get("suspensionStartDate")

        if not start_date_str:
            continue

        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d")

            if start_date < one_month_ago:
                email = user["primaryEmail"]
                delete_user(service, email)
                print(f"Deleted user: {email}")
        except Exception as e:
            print(f"Error processing user {user.get('primaryEmail')}: {e}")

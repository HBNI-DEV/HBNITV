import asyncio
from datetime import datetime

import psycopg2
from tornado.ioloop import PeriodicCallback

from app.config.environments import Environment
from app.utils import google_api

# Global cache
users_cache = {}
organizational_units_cache = {}


def _get_connection():
    return psycopg2.connect(
        dbname=Environment.POSTGRES_DB,
        user=Environment.POSTGRES_USER,
        password=Environment.POSTGRES_PASSWORD,
        host=Environment.POSTGRES_HOST,
        port=Environment.POSTGRES_PORT,
    )


def create_users_table_if_not_exists():
    conn = _get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS google_users (
                id TEXT PRIMARY KEY,
                primary_email TEXT NOT NULL,
                full_name TEXT,
                is_admin BOOLEAN,
                is_delegated_admin BOOLEAN,
                suspended BOOLEAN,
                archived BOOLEAN,
                org_unit_path TEXT,
                last_login TIMESTAMPTZ,
                photo_base64 TEXT
            )
        """)
        conn.commit()
    finally:
        cur.close()
        conn.close()


def _query_users(query: str, params: tuple = ()) -> list[dict[str, str | bool]]:
    conn = _get_connection()
    cur = conn.cursor()
    try:
        cur.execute(query, params)
        columns = [desc[0] for desc in cur.description]
        return [dict(zip(columns, row)) for row in cur.fetchall()]
    finally:
        cur.close()
        conn.close()


def get_users_from_db() -> list[dict[str, str | bool]]:
    return _query_users("SELECT * FROM google_users")


def get_user_from_db(user_id: str) -> dict[str, str | bool]:
    return _query_users("SELECT * FROM google_users WHERE id = %s", (user_id,))[0]


def get_users_from_db_from_org_unit(org_unit_path: str) -> list[dict[str, str | bool]]:
    return _query_users(
        "SELECT * FROM google_users WHERE org_unit_path = %s", (org_unit_path,)
    )


def _insert_user(user_id: str, user_data: dict):
    service = google_api.get_workspace_directory_service()
    conn = _get_connection()
    cur = conn.cursor()
    try:
        primary_email = user_data.get("primaryEmail")
        full_name = user_data.get("name", {}).get("fullName")
        is_admin = user_data.get("isAdmin", False)
        is_delegated_admin = user_data.get("isDelegatedAdmin", False)
        suspended = user_data.get("suspended", False)
        archived = user_data.get("archived", False)
        org_unit_path = user_data.get("orgUnitPath")

        last_login_str = user_data.get("lastLoginTime")
        if last_login_str:
            try:
                last_login = datetime.fromisoformat(
                    last_login_str.replace("Z", "+00:00")
                )
            except ValueError:
                last_login = None
        else:
            last_login = None

        # Try to fetch profile photo
        try:
            photo = google_api.get_user_photo(service, user_id)
            photo_base64 = photo.get("photoData")
        except Exception:
            photo_base64 = None

        cur.execute(
            """
            INSERT INTO google_users (
                id, primary_email, full_name, is_admin, is_delegated_admin,
                suspended, archived, org_unit_path, last_login, photo_base64
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                primary_email = EXCLUDED.primary_email,
                full_name = EXCLUDED.full_name,
                is_admin = EXCLUDED.is_admin,
                is_delegated_admin = EXCLUDED.is_delegated_admin,
                suspended = EXCLUDED.suspended,
                archived = EXCLUDED.archived,
                org_unit_path = EXCLUDED.org_unit_path,
                last_login = EXCLUDED.last_login,
                photo_base64 = EXCLUDED.photo_base64
        """,
            (
                user_id,
                primary_email,
                full_name,
                is_admin,
                is_delegated_admin,
                suspended,
                archived,
                org_unit_path,
                last_login,
                photo_base64,
            ),
        )
        conn.commit()
    finally:
        cur.close()
        conn.close()


def get_users_from_db_ids() -> set[str]:
    conn = _get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM google_users")
        return set(row[0] for row in cur.fetchall())
    finally:
        cur.close()
        conn.close()


def delete_user_from_db(user_id: str):
    conn = _get_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM google_users WHERE id = %s", (user_id,))
        conn.commit()
    finally:
        cur.close()
        conn.close()


def update_user_cache():
    global users_cache, organizational_units_cache
    try:
        create_users_table_if_not_exists()
        users_cache.clear()
        organizational_units_cache.clear()
        organizational_units_cache = google_api.get_all_org_units()
        users = google_api.get_all_users()

        current_user_ids = set()
        for user in users:
            user_id = user["id"]
            current_user_ids.add(user_id)
            users_cache[user_id] = user
            _insert_user(user_id, user)

        existing_user_ids = get_users_from_db_ids()
        deleted_user_ids = existing_user_ids - current_user_ids
        for deleted_id in deleted_user_ids:
            delete_user_from_db(deleted_id)
    except Exception as e:
        print(f"[UserCache] ❌ Error updating cache: {e}")


def start_users_cache_updater():
    async def run_in_thread():
        await asyncio.to_thread(update_user_cache)

    PeriodicCallback(
        lambda: asyncio.ensure_future(run_in_thread()),
        60000 * Environment.UPDATE_USER_CACHE_INTERVAL_MINUTES,
    ).start()

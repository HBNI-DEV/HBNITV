import json

import psycopg2

from app.config.environments import Environment
from app.handlers.core.base import BaseHandler
from app.handlers.core.require_role import require_role


class SharedGoogleFolderIDsAPIHandler(BaseHandler):
    _db_checked = False
    _table_name = "shared_google_folders"

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "Content-Type")
        self.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
        self.set_header("Content-Type", "application/json")

    def options(self):
        self.set_status(204)
        self.finish()

    def initialize(self):
        self.conn = psycopg2.connect(
            dbname=Environment.POSTGRES_DB,
            user=Environment.POSTGRES_USER,
            password=Environment.POSTGRES_PASSWORD,
            host=Environment.POSTGRES_HOST,
            port=Environment.POSTGRES_PORT,
        )
        self.conn.autocommit = True
        self.cur = self.conn.cursor()

        if not SharedGoogleFolderIDsAPIHandler._db_checked:
            self.ensure_table()
            SharedGoogleFolderIDsAPIHandler._db_checked = True

    def ensure_table(self):
        self.cur.execute(f"""
            CREATE TABLE IF NOT EXISTS {self._table_name} (
                folder_id TEXT PRIMARY KEY,
                delegated_email TEXT NOT NULL
            )
        """)

    def get(self):
        try:
            self.cur.execute(
                f"SELECT folder_id, delegated_email FROM {self._table_name}"
            )
            rows = self.cur.fetchall()
            self.write(
                {
                    "status": "success",
                    "folders": [
                        {"folder_id": row[0], "delegated_email": row[1]} for row in rows
                    ],
                }
            )
        except Exception as e:
            self.write_error_response(e)

    @require_role("admin", "super_admin")
    def post(self):
        try:
            payload = json.loads(self.request.body)
            folder_id = payload.get("folder_id")
            delegated_email = payload.get("delegated_email")

            if not folder_id or not delegated_email:
                self.write_error_message(400, "Missing folder_id or delegated_email")
                return

            self.cur.execute(
                f"""
                INSERT INTO {self._table_name} (folder_id, delegated_email)
                VALUES (%s, %s)
                ON CONFLICT (folder_id) DO UPDATE SET delegated_email = EXCLUDED.delegated_email
                """,
                (folder_id, delegated_email),
            )

            self.write(
                {
                    "status": "success",
                    "folder_id": folder_id,
                    "delegated_email": delegated_email,
                }
            )
        except json.JSONDecodeError:
            self.write_error_message(400, "Invalid JSON")
        except Exception as e:
            self.write_error_response(e)

    @require_role("admin", "super_admin")
    def delete(self):
        try:
            folder_id = self.get_argument("folder_id", None)

            if not folder_id:
                self.write_error_message(400, "Missing folder_id")
                return

            self.cur.execute(
                f"DELETE FROM {self._table_name} WHERE folder_id = %s", (folder_id,)
            )

            if self.cur.rowcount > 0:
                self.write(
                    {"status": "success", "message": f"Folder {folder_id} deleted"}
                )
            else:
                self.set_status(404)
                self.write({"status": "error", "message": "Folder ID not found"})
        except Exception as e:
            self.write_error_response(e)

    def on_finish(self):
        if hasattr(self, "cur"):
            self.cur.close()
        if hasattr(self, "conn"):
            self.conn.close()

    def write_error_response(self, error):
        self.set_status(500)
        self.write({"status": "error", "message": str(error)})

    def write_error_message(self, status_code, message):
        self.set_status(status_code)
        self.write({"status": "error", "message": message})

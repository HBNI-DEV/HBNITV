import json

import psycopg2

from app.config.environments import Environment
from app.handlers.core.base import BaseHandler
from app.handlers.core.require_role import require_role


class UpdateFoldersAPIHandler(BaseHandler):
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

        if not UpdateFoldersAPIHandler._db_checked:
            UpdateFoldersAPIHandler._db_checked = True

    @require_role("admin", "super_admin")
    def post(self):
        try:
            delegated_email = self.current_email
            payload = json.loads(self.request.body)
            for folder in payload:
                folder_id = folder.get("folderId")
                allowed_accounts = folder.get("allowedAccounts", [])

                self.cur.execute(
                    f"""
                    INSERT INTO {self._table_name} (folder_id, delegated_email, allowed_accounts)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (folder_id) DO UPDATE SET delegated_email = EXCLUDED.delegated_email, allowed_accounts = EXCLUDED.allowed_accounts
                    """,
                    (folder_id, delegated_email, allowed_accounts),
                )

            self.write(
                {
                    "status": "success",
                    "delegated_email": delegated_email,
                }
            )
        except json.JSONDecodeError:
            print(400, "Invalid JSON")
        except Exception as e:
            print(e)
            self.write({"status": "error", "message": str(e)})

    @require_role("admin", "super_admin")
    def delete(self, folder_id: str):
        try:
            if not folder_id:
                self.write_error(400)
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
            self.write_error(500, error_message=str(e))

    def on_finish(self):
        if hasattr(self, "cur"):
            self.cur.close()
        if hasattr(self, "conn"):
            self.conn.close()

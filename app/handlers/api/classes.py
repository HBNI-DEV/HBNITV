from app.config.environments import Environment
from app.handlers.core.base import BaseHandler
from app.utils import google_api


class ClassesAPIHandler(BaseHandler):
    def prepare(self):
        self.set_header("Content-Type", "application/json")
        role = self.current_role
        if not role:
            self.write_error(403, error_message="Unauthorized")
        if role not in ("admin", "super_admin"):
            self.write_error(403, error_message="Unauthorized")

    def get(self):
        file_id = self.get_query_argument("id", None)
        drive_service = google_api.get_drive_service()
        if file_id:
            file = google_api.get_file_metadata(drive_service, file_id)
            self.write(file)
        else:
            mp4_files = google_api.list_mp4_files_in_folder(
                drive_service, Environment.CLASSES_FOLDER_ID
            )

            self.write({"files": mp4_files})

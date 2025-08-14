import copy

from app.handlers.core.base import BaseHandler
from app.handlers.generic_page import GenericPageHandler
from app.routes.helpers import route
from app.utils.recordings_cache import RecordingItem, recordings_cache


def can_view(item: RecordingItem, user_identity: str) -> bool:
    for owner in item.get("owners", []):
        if owner.get("emailAddress").lower() in user_identity:
            return True

    if allowed_accounts := item.get("allowedAccounts", []):
        for entry in allowed_accounts:
            if entry.lower() in user_identity:
                return True

    return False


def get_recording_item(recording_id: str) -> RecordingItem | None:
    return next(
        (recording_item for recording_item in recordings_cache if recording_item.get("id") == recording_id),
        None,
    )


class RecordingsPageHandler(BaseHandler):
    def get(self):
        user_identity = self._build_identity()

        data = copy.deepcopy(recordings_cache)

        filtered_tabs = []
        filtered_tabs.extend(recording_item for recording_item in data if can_view(recording_item, user_identity))

        recordings = {}
        for recording_item in filtered_tabs:
            folder_id = recording_item.get("folderId")
            if folder_id not in recordings:
                recordings[folder_id] = []
            recordings[folder_id].append(recording_item)

        self.render_template("recordings.html", recordings=recordings)


class WatchRecordingHandler(BaseHandler):
    def get(self):
        recording_id = self.get_query_argument("id", None)
        if not recording_id:
            self.write_error(400, error_message="Missing id")
            return

        if recordings_cache is None:
            self.write_error(503, error_message="Recordings cache not ready")
            return

        recording = get_recording_item(recording_id)
        if not recording:
            self.write_error(404, error_message="Recording not found")
            return

        if not can_view(recording, self._build_identity()):
            self.write_error(403, error_message="Unauthorized")
            return

        self.set_header("Cache-Control", "no-store")
        self.render_template("watch_recording.html")


view_routes = [
    route(r"/", GenericPageHandler, template_name="index.html"),
    route(r"/news", GenericPageHandler, template_name="news.html"),
    route(r"/recordings", RecordingsPageHandler),
    route(r"/recordings/watch", WatchRecordingHandler),
    route(r"/calendar", GenericPageHandler, template_name="calendar.html"),
    route(r"/contact", GenericPageHandler, template_name="contact.html"),
    route(r"/news", GenericPageHandler, template_name="news.html"),
    route(r"/settings", GenericPageHandler, template_name="settings.html"),
]

from app.handlers.generic_page import GenericPageHandler
from app.routes.helpers import route
from app.utils.recordings_cache import recordings_cache

view_routes = [
    route(r"/", GenericPageHandler, template_name="index.html"),
    route(r"/news", GenericPageHandler, template_name="news.html"),
    route(
        r"/recordings",
        GenericPageHandler,
        template_name="recordings.html",
        extra_context={"recordings": recordings_cache},
    ),
    route(
        r"/recordings/watch", GenericPageHandler, template_name="watch_recording.html"
    ),
    route(r"/calendar", GenericPageHandler, template_name="calendar.html"),
    route(r"/contact", GenericPageHandler, template_name="contact.html"),
    route(r"/news", GenericPageHandler, template_name="news.html"),
    route(r"/settings", GenericPageHandler, template_name="settings.html"),
]

from tornado.web import StaticFileHandler

from app.handlers.api.login import LoginAPIHandler
from app.handlers.api.logout import LogoutAPIHandler
from app.handlers.api.register import RegisterAPIHandler
from app.handlers.special.service_worker import ServiceWorkerHandler
from app.handlers.views.admin import AdminPageHandler
from app.handlers.views.calendar import CalendarHandler
from app.handlers.views.classes import ClassesHandler
from app.handlers.views.contact import ContactHandler
from app.handlers.views.index import IndexHandler
from app.handlers.views.news import NewsHandler
from app.handlers.views.register import RegisterViewHandler
from app.handlers.views.settings import SettingsHandler

url_patterns = [
    (r"/", IndexHandler),
    (r"/api/login", LoginAPIHandler),
    (r"/api/logout", LogoutAPIHandler),
    (r"/api/register", RegisterAPIHandler),
    (r"/admin", AdminPageHandler),
    (r"/admin/", AdminPageHandler),
    (r"/settings", SettingsHandler),
    (r"/register", RegisterViewHandler),
    (r"/calendar", CalendarHandler),
    (r"/classes", ClassesHandler),
    (r"/news", NewsHandler),
    (r"/contact", ContactHandler),
    (r"/service-worker.js", ServiceWorkerHandler),
    (r"/static/(.*)", StaticFileHandler, {"path": "static"}),
    (r"/public/(.*)", StaticFileHandler, {"path": "public"}),
    (
        r"/(service-worker\.js|workbox-.*\.js)",
        StaticFileHandler,
        {"path": "public/dist"},
    ),
]

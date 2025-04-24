from tornado.web import StaticFileHandler

from app.handlers.admin import AdminPageHandler
from app.handlers.calendar import CalendarHandler
from app.handlers.classes import ClassesHandler
from app.handlers.contact import ContactHandler
from app.handlers.index import IndexHandler
from app.handlers.login import LoginHandler
from app.handlers.logout import LogoutHandler
from app.handlers.news import NewsHandler
from app.handlers.register import RegisterHandler
from app.handlers.service_worker import ServiceWorkerHandler
from app.handlers.settings import SettingsHandler

url_patterns = [
    (r"/", IndexHandler),
    (r"/admin", AdminPageHandler),
    (r"/admin/", AdminPageHandler),
    (r"/settings", SettingsHandler),
    (r"/register", RegisterHandler),
    (r"/calendar", CalendarHandler),
    (r"/classes", ClassesHandler),
    (r"/news", NewsHandler),
    (r"/contact", ContactHandler),
    (r"/login", LoginHandler),
    (r"/logout", LogoutHandler),
    (r"/service-worker.js", ServiceWorkerHandler),
    (r"/static/(.*)", StaticFileHandler, {"path": "static"}),
    (r"/public/(.*)", StaticFileHandler, {"path": "public"}),
    (
        r"/(service-worker\.js|workbox-.*\.js)",
        StaticFileHandler,
        {"path": "public/dist"},
    ),
]

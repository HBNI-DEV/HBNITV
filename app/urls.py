from tornado.routing import URLSpec
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


def route(pattern, handler, name=None, **kwargs):
    return URLSpec(pattern, handler, kwargs or None, name=name)


api_routes = [
    route(r"/api/login", LoginAPIHandler, name="api_login"),
    route(r"/api/logout", LogoutAPIHandler, name="api_logout"),
    route(r"/api/register", RegisterAPIHandler, name="api_register"),
]

view_routes = [
    route(r"/", IndexHandler, name="index"),
    route(r"/admin", AdminPageHandler, name="admin"),
    route(r"/admin/", AdminPageHandler),
    route(r"/settings", SettingsHandler),
    route(r"/register", RegisterViewHandler),
    route(r"/calendar", CalendarHandler),
    route(r"/classes", ClassesHandler),
    route(r"/news", NewsHandler),
    route(r"/contact", ContactHandler),
]

static_routes = [
    route(r"/service-worker.js", ServiceWorkerHandler),
    route(r"/static/(.*)", StaticFileHandler, path="static"),
    route(r"/public/(.*)", StaticFileHandler, path="public"),
    route(
        r"/(service-worker\.js|workbox-.*\.js)", StaticFileHandler, path="public/dist"
    ),
]

url_patterns = api_routes + view_routes + static_routes

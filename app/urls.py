from tornado.routing import URLSpec
from tornado.web import StaticFileHandler

from app.handlers.api.login import LoginAPIHandler
from app.handlers.api.logout import LogoutAPIHandler
from app.handlers.api.news import NewsAPIHandler
from app.handlers.api.register import RegisterAPIHandler
from app.handlers.special.service_worker import ServiceWorkerHandler
from app.handlers.views.admin import AdminPageHandler
from app.handlers.views.calendar import CalendarPageHandler
from app.handlers.views.classes import ClassesPageHandler
from app.handlers.views.contact import ContactPageHandler
from app.handlers.views.index import IndexPageHandler
from app.handlers.views.news import NewsPageHandler
from app.handlers.views.register import RegisterPageHandler
from app.handlers.views.settings import SettingsPageHandler


def route(pattern, handler, name=None, **kwargs):
    return URLSpec(pattern, handler, kwargs or None, name=name)


api_routes = [
    route(r"/api/news", NewsAPIHandler, name="api_news"),
    route(r"/api/login", LoginAPIHandler, name="api_login"),
    route(r"/api/logout", LogoutAPIHandler, name="api_logout"),
    route(r"/api/register", RegisterAPIHandler, name="api_register"),
]

view_routes = [
    route(r"/", IndexPageHandler, name="index"),
    route(r"/admin", AdminPageHandler, name="admin"),
    route(r"/admin/register", RegisterPageHandler, name="admin_register"),
    route(r"/settings", SettingsPageHandler),
    route(r"/register", RegisterPageHandler),
    route(r"/calendar", CalendarPageHandler),
    route(r"/classes", ClassesPageHandler),
    route(r"/news", NewsPageHandler),
    route(r"/contact", ContactPageHandler),
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

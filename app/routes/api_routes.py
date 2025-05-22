from app.handlers.api.assignment import AssignmentAPIHandler
from app.handlers.api.classes import ClassesAPIHandler
from app.handlers.api.login import LoginAPIHandler
from app.handlers.api.logout import LogoutAPIHandler
from app.handlers.api.news import NewsAPIHandler
from app.handlers.api.register import RegisterAPIHandler
from app.handlers.api.thumbnail import ThumbnailProxyHandler
from app.routes.helpers import route

api_routes = [
    route(r"/api/news", NewsAPIHandler, name="api_news"),
    route(r"/api/login", LoginAPIHandler, name="api_login"),
    route(r"/api/logout", LogoutAPIHandler, name="api_logout"),
    route(r"/api/register", RegisterAPIHandler, name="api_register"),
    route(r"/api/assignment", AssignmentAPIHandler, name="api_assignment"),
    route(r"/api/classes", ClassesAPIHandler, name="api_classes"),
    route(r"/api/thumbnail", ThumbnailProxyHandler, name="api_thumbnail"),
]

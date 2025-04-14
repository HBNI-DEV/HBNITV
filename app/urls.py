from app.handlers.index import IndexHandler
from app.handlers.login import LoginHandler
from tornado.web import StaticFileHandler

url_patterns = [
    (r"/", IndexHandler),
    (r"/login", LoginHandler),
    (r"/static/(.*)", StaticFileHandler, {"path": "static"}),
    (r"/public/(.*)", StaticFileHandler, {"path": "public"}),
]
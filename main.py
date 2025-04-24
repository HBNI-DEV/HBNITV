from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado.web import Application

from app.config.environments import Environment
from app.urls import url_patterns


class TornadoApp(Application):
    def __init__(self):
        Application.__init__(
            self, url_patterns, cookie_secret="hbni-itv-secret", static_hash_cache=True
        )


def main():
    print(f"🔧 Starting Tornado on port {Environment.PORT}...")
    app = TornadoApp()
    http_server = HTTPServer(app)
    http_server.listen(Environment.PORT)
    IOLoop.instance().start()


if __name__ == "__main__":
    main()

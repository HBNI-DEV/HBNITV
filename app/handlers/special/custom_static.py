from tornado.web import StaticFileHandler


class CustomStaticFileHandler(StaticFileHandler):
    def set_extra_headers(self, path):
        self.set_header("Cache-Control", "public, max-age=604800")  # 1 week cache

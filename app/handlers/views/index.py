from app.handlers.core.base import BaseHandler


class IndexPageHandler(BaseHandler):
    def get(self):
        self.render_template(
            "index.html",
        )

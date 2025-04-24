from app.handlers.base import BaseHandler


class NewsHandler(BaseHandler):
    def get(self):
        self.render_template(
            "news.html",
        )

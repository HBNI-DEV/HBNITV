from app.handlers.core.base import BaseHandler


class ClassesPageHandler(BaseHandler):
    def get(self):
        self.render_template("classes.html")

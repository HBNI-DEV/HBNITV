from app.handlers.core.base import BaseHandler


class ClassesHandler(BaseHandler):
    def get(self):
        self.render_template("classes.html")

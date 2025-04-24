from app.handlers.base import BaseHandler


class ClassesHandler(BaseHandler):
    def get(self):
        self.render_template("classes.html")
